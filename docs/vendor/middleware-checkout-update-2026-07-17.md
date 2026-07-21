# Web Server Middleware 업데이트 안내

작성일: 2026-07-17

이 문서는 최근 `web-server` middleware에 추가된 Screen Golf 예약·온라인 결제 관련 변경사항과 고객사 웹에서 반영해야 할 내용을 정리한 문서입니다.

## 1. 핵심 변경사항

기존에는 middleware가 예약 생성과 조회·취소까지만 제공했지만, 이번 업데이트에서 다음 기능이 추가됐습니다.

- 서버 운영 설정 기반 예약 정책 조회
- 여러 개의 연속 30분 slot을 예약 1건으로 생성
- Moneris Hosted Checkout session 생성
- Checkout 완료 후 서버 간 Receipt 검증
- 결제 상태 조회 및 callback 유실 대응
- 예약 취소 후 환불 금액·상태 반환
- 모든 주요 mutation에 client `Idempotency-Key` 적용
- 고객사용 OpenAPI 3.1 문서 제공
- production CORS origin allowlist 적용
- core API 요청 timeout 적용

예약·결제·환불의 최종 source of truth는 `screen_golf_web`입니다. `web-server`는 고객 JWT 검증, 예약 소유권 확인, 요청/응답 변환을 담당하는 BFF 역할만 수행합니다.

```text
고객사 브라우저
  -> web-server middleware
    -> screen_golf_web
      -> Supabase/Postgres + Moneris Checkout
```

Moneris credential과 내부 `sgsk_*` API key는 브라우저에 전달되지 않습니다.

## 2. 현재 적용 상태

업데이트 코드는 다음 기능 브랜치에 구현되어 있습니다.

```text
web-server:      codex/screen-golf-checkout-api
screen_golf_web: codex/moneris-checkout-core
```

아직 `main` 병합 및 Staging 배포 전이라면 실제 Staging에서는 새 endpoint가 보이지 않을 수 있습니다.

`web-server` 기능 브랜치 기준 검증 결과:

- 전체 테스트: 97개 통과
- TypeScript production build 통과
- 고객사용 OpenAPI 테스트 통과
- JWT 인증, 소유권, CORS, Idempotency 테스트 통과

## 3. 회원 인증과 사용자 매핑

고객사 웹은 Green Tee 앱과 동일한 Supabase Auth 프로젝트를 사용합니다.

모든 예약 API 요청에는 Supabase access token을 전달해야 합니다.

```http
Authorization: Bearer <supabase_access_token>
```

middleware는 JWT의 값을 다음과 같이 사용합니다.

```text
externalProvider = green_tee_flutter
externalUserId   = JWT sub
email            = JWT email
```

웹과 앱에서 같은 Supabase 사용자를 사용하면 동일한 내부 사용자와 예약 이력으로 연결됩니다. 이번 출시에서는 `green_tee_web` 같은 별도 provider를 사용하지 않습니다.

회원가입에는 email/password만 있으면 됩니다.

- password는 예약 middleware나 `screen_golf_web`으로 전달하지 않습니다.
- `display_name`, 전화번호 등은 선택 프로필 정보입니다.
- 예약 생성 시 JWT에 email claim이 없으면 `422 VALIDATION_FAILED`가 반환됩니다.

## 4. 공통 요청 헤더

```http
Authorization: Bearer <supabase_access_token>
Accept: application/json
Content-Type: application/json
Idempotency-Key: <client-generated-key>
```

`Idempotency-Key`는 8자 이상 255자 이하여야 하며 다음 요청에 필수입니다.

- 예약 생성
- Checkout session 생성
- Checkout 완료 검증
- 예약 취소·환불

권장 예시:

```text
reservation-550e8400-e29b-41d4-a716-446655440000
checkout-session-550e8400-e29b-41d4-a716-446655440000
checkout-complete-550e8400-e29b-41d4-a716-446655440000
cancellation-550e8400-e29b-41d4-a716-446655440000
```

각 상태 변경 작업에는 서로 다른 key를 사용하세요. 네트워크 timeout 후 같은 작업을 재시도할 때만 기존 key와 동일한 body를 다시 사용합니다.

middleware는 다음 값을 포함해 내부 key를 파생합니다.

```text
mw_<sha256(userId | method | path | clientKey)>
```

따라서 여러 사용자가 우연히 같은 client key를 사용해도 내부에서 충돌하지 않습니다.

| 요청 상황 | 결과 |
| --- | --- |
| 같은 key + 같은 요청 | 기존 처리 결과 재생 |
| 같은 key + 다른 body | `422 VALIDATION_FAILED` |
| 같은 key 요청이 처리 중 | `409 CONFLICT` |

## 5. 추가·변경된 Endpoint

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/v1/simulator/policies/booking` | 예약 가능 기간, cutoff, 운영시간 조회 |
| POST | `/api/v1/simulator/reservations` | 연속 slot 범위를 예약 1건으로 생성 |
| POST | `/api/v1/simulator/reservations/{id}/checkout/session` | Hosted Checkout ticket 생성 |
| POST | `/api/v1/simulator/reservations/{id}/checkout/complete` | Moneris Receipt 서버 검증 |
| GET | `/api/v1/simulator/reservations/{id}/checkout` | 결제 상태 조회 |
| POST | `/api/v1/simulator/reservations/{id}/cancel` | 예약 취소 및 환불 처리 시작 |
| GET | `/api/v1/openapi.json` | 고객사용 OpenAPI 3.1 문서 |

기존 방, 가격, availability, 예약 목록·상세 endpoint도 그대로 유지됩니다.

```text
GET /api/v1/simulator/rooms
GET /api/v1/pricing
GET /api/v1/simulator/availability
GET /api/v1/simulator/reservations
GET /api/v1/simulator/reservations/{id}
```

## 6. 예약 정책 조회

예약 가능 기간이나 당일 마감 시간을 UI에 하드코딩하지 말고 아래 endpoint 결과를 사용하세요.

```http
GET /api/v1/simulator/policies/booking
```

응답 예시:

```json
{
  "advanceBookingDays": 14,
  "sameDayCutoffMinutes": 60,
  "maxPerDayPerUser": 1,
  "maxPerWeekPerUser": 5,
  "pendingHoldMinutes": 10,
  "checkoutSessionMinutes": 15,
  "operatingHours": [
    {
      "dayOfWeek": 1,
      "isOpen": true,
      "openTime": "09:00",
      "closeTime": "22:00"
    }
  ]
}
```

이 값은 운영 설정에 따라 변경될 수 있고 서버가 최종 검증합니다.

## 7. 여러 slot 예약 방식

availability 응답은 30분 단위 slot으로 제공되지만, 여러 개의 연속 slot은 예약 1건으로 생성합니다.

예를 들어 사용자가 18:00~20:00를 선택하면 다음처럼 예약을 생성합니다.

```http
POST /api/v1/simulator/reservations
Idempotency-Key: reservation-550e8400-e29b-41d4-a716-446655440000
```

```json
{
  "roomId": "00000000-0000-0000-0000-000000000001",
  "startsAt": "2026-07-20T18:00:00-07:00",
  "endsAt": "2026-07-20T20:00:00-07:00",
  "partySize": 2
}
```

서버 내부에서는 연속 30분 slot 4개의 가용성과 가격을 검증하지만, 외부에서는 다음과 같이 처리됩니다.

```text
예약 1건
결제 1건
예약 총액 = 4개 slot 가격 합계 + 세금
```

서버 검증 규칙:

- 최소 30분
- 30분의 정수 배수
- 시작과 종료가 availability slot 경계와 일치
- 같은 방의 모든 중간 slot이 연속으로 예약 가능
- 영업시간, cutoff, 인원, 기존 예약, block, 가격 규칙 통과

45분 예약, 비정렬 시간, 중간에 이미 예약된 slot이 있는 범위는 거절됩니다.

## 8. 권장 온라인 결제 흐름

```text
정책/방/availability 조회
  -> pending 예약 생성
  -> Checkout session 생성
  -> Moneris Hosted Checkout UI 시작
  -> 브라우저 callback 수신
  -> Checkout complete 호출
  -> processing이면 결제 상태 polling
  -> succeeded 후 confirmed 예약 표시
```

중요: 브라우저 callback 자체는 결제 성공을 의미하지 않습니다.

`screen_golf_web`이 Moneris Receipt를 서버 간 요청으로 조회하고 다음 값을 검증한 후에만 결제를 성공 처리합니다.

- Checkout ticket
- order ID
- 결제 금액
- currency
- transaction/reference number

### 8.1 Checkout session 생성

```http
POST /api/v1/simulator/reservations/{reservationId}/checkout/session
Idempotency-Key: checkout-session-550e8400-e29b-41d4-a716-446655440000
```

요청 body는 없습니다.

응답 예시:

```json
{
  "paymentId": "00000000-0000-4000-8000-000000000001",
  "ticket": "public-short-lived-ticket",
  "expiresAt": "2026-07-20T17:15:00Z",
  "environment": "qa"
}
```

`ticket`은 Hosted Checkout을 시작하기 위한 public handoff 값일 뿐 결제 성공 증명이 아닙니다.

### 8.2 Checkout 완료 검증

Moneris browser callback을 받은 후 다음 endpoint를 호출합니다.

```http
POST /api/v1/simulator/reservations/{reservationId}/checkout/complete
Idempotency-Key: checkout-complete-550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
```

```json
{
  "ticket": "public-short-lived-ticket"
}
```

응답 예시:

```json
{
  "status": "processing"
}
```

가능한 상태:

| Status | 의미 | 화면 처리 |
| --- | --- | --- |
| `succeeded` | Receipt 검증 및 예약 확정 완료 | 예약 완료 화면 |
| `declined` | 결제 거절 확정 | 결제 실패 안내 |
| `processing` | 결과 확인 중 | 새 결제 금지, 상태 polling |
| `review_required` | 자동 확인 한도 초과 | 재결제 금지, 운영 문의 안내 |

### 8.3 결제 상태 조회

```http
GET /api/v1/simulator/reservations/{reservationId}/checkout
```

```json
{
  "paymentId": "00000000-0000-4000-8000-000000000001",
  "status": "processing",
  "amountCents": 17920,
  "currency": "CAD",
  "expiresAt": "2026-07-20T17:15:00Z",
  "failureMessage": null
}
```

권장 polling 간격은 2~5초입니다. 다음 상태에서 polling을 종료합니다.

```text
succeeded
declined
failed
review_required
```

`processing` 또는 `review_required` 상태에서는 새 Checkout session이나 Purchase를 만들지 마세요.

## 9. 예약 취소와 환불 응답

취소 요청에도 `Idempotency-Key`가 필요합니다.

```http
POST /api/v1/simulator/reservations/{reservationId}/cancel
Idempotency-Key: cancellation-550e8400-e29b-41d4-a716-446655440000
```

응답 예시:

```json
{
  "reservation": {
    "id": "00000000-0000-0000-0000-000000000099",
    "status": "cancelled"
  },
  "refundCents": 8960,
  "refundAmountCents": 8960,
  "refundPercent": 50,
  "refundStatus": "processing"
}
```

`refundCents`와 `refundAmountCents`는 현재 동일한 금액을 나타내는 호환 필드입니다.

| refundStatus | 의미 |
| --- | --- |
| `null` | 환불할 결제금액 없음 또는 0% 환불 |
| `pending` | 환불 작업 생성됨 |
| `processing` | provider 결과 확인 중 |
| `succeeded` | 실제 환불 성공 확인 |
| `failed` | 환불 실패 확정 |
| `review_required` | 운영자 수동 검토 필요 |

예약이 `cancelled`여도 `refundStatus`가 `processing` 또는 `review_required`이면 고객에게 환불 완료라고 표시하면 안 됩니다.

결제 상태가 아직 `processing` 또는 `review_required`인 경우 중복 금융 처리를 막기 위해 취소가 `409 CONFLICT`로 거절될 수 있습니다.

## 10. 예약 소유권 보호

예약 상세, Checkout session, Checkout 완료, Checkout 상태 조회, 예약 취소는 모두 middleware에서 먼저 예약 소유권을 확인합니다.

JWT 사용자가 소유하지 않은 예약 ID를 전달하면 `404 NOT_FOUND`가 반환됩니다. 브라우저가 예약 ID만 알고 있어도 다른 사용자의 예약 또는 결제 상태를 조회할 수 없습니다.

## 11. 오류 처리와 재시도

공통 오류 응답 예시:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Checkout is already processing"
  }
}
```

| HTTP | Code | 주요 상황 |
| --- | --- | --- |
| `400` | `VALIDATION_FAILED` | query 또는 body 형식 오류 |
| `401` | `UNAUTHORIZED` | JWT 누락, 만료, 검증 실패 |
| `403` | `FORBIDDEN` | 비활성 endpoint 또는 권한 부족 |
| `404` | `NOT_FOUND` | resource 없음 또는 비소유 예약 |
| `409` | `CONFLICT` | slot 충돌, 결제 처리 중, 같은 key 요청 처리 중 |
| `422` | `VALIDATION_FAILED` | Idempotency-Key 또는 business rule 위반 |
| `500` | `INTERNAL_ERROR` | middleware 또는 core의 예기치 못한 오류 |

middleware의 core API timeout 기본값은 10초입니다.

재시도 규칙:

- GET 요청은 bounded exponential backoff로 재시도할 수 있습니다.
- mutation timeout은 동일한 `Idempotency-Key`와 동일 요청으로만 재시도합니다.
- timeout이 발생해도 서버에서 실제 처리가 완료됐을 수 있습니다.
- 새 key로 다시 결제하기 전에 예약/Checkout 상태를 먼저 조회합니다.
- 고객 문의에는 응답의 `X-Request-Id`를 전달합니다.

access token, Checkout ticket, 내부 API key, 결제 credential은 로그나 문의 내용에 포함하지 마세요.

## 12. OpenAPI 문서

고객사용 OpenAPI 3.1 문서는 아래 endpoint에서 인증 없이 조회할 수 있습니다.

```http
GET /api/v1/openapi.json
```

문서에는 다음 내용이 포함됩니다.

- Supabase bearer 인증
- customer-facing `camelCase` schema
- 필수 `Idempotency-Key` 길이 및 header
- 예약 정책과 30분 연속 slot 규칙
- Checkout session/complete/status
- 취소·환불 상태
- 공통 오류 응답

고객사 API client type을 작성할 때 이 문서를 기준으로 사용하면 됩니다.

## 13. CORS와 서버 환경설정

production에서는 wildcard CORS를 사용하지 않습니다. 고객사 웹 origin을 명시적으로 등록해야 합니다.

```text
CUSTOMER_WEB_ORIGINS=https://booking.example.com,https://members.example.com
```

허용된 browser request header:

```text
Authorization
Content-Type
Idempotency-Key
```

브라우저에 노출되는 응답 header:

```text
X-Request-Id
```

middleware 배포에 필요한 Screen Golf 관련 환경변수:

```text
SCREEN_GOLF_API_URL=https://<screen-golf-core-host>
SCREEN_GOLF_API_KEY=sgsk_<server-only>
SCREEN_GOLF_API_TIMEOUT_MS=10000
CUSTOMER_WEB_ORIGINS=https://<customer-web-origin>
ENABLE_SCREEN_GOLF_TEST_CHECKOUT=false
```

주의:

- `SCREEN_GOLF_API_KEY`는 브라우저에 노출하지 않습니다.
- `MONERIS_*` credential은 middleware가 아니라 `screen_golf_web`에만 설정합니다.
- production에서 `CUSTOMER_WEB_ORIGINS`가 비어 있으면 middleware가 시작되지 않습니다.
- `/health`의 `screenGolfConfigured`는 core URL/key 설정 여부만 나타내며 Moneris 또는 DB deep health check는 아닙니다.

## 14. 협업 개발자 반영 체크리스트

- [ ] Green Tee와 동일한 Supabase Auth 프로젝트로 로그인 처리
- [ ] 모든 customer API에 최신 Supabase access token 전달
- [ ] 예약 생성 전 정책 endpoint 조회
- [ ] availability에서 연속 slot 선택 UI 구현
- [ ] 여러 slot을 예약 1건의 `startsAt`/`endsAt` 범위로 전송
- [ ] 예약·session·complete·cancel 각각 별도 `Idempotency-Key` 생성
- [ ] Checkout session 응답의 ticket으로 Moneris Hosted Checkout 실행
- [ ] browser callback 후 반드시 Checkout complete 호출
- [ ] `processing`일 때 결제 상태 polling
- [ ] `processing`/`review_required` 상태에서 재결제 차단
- [ ] 예약 `confirmed`와 결제 `succeeded` 확인 후 완료 화면 표시
- [ ] 취소 화면에 `refundStatus`를 별도로 표시
- [ ] `refundStatus=succeeded` 전에는 환불 완료 문구를 표시하지 않음
- [ ] `409` 발생 시 availability 또는 Checkout 상태 재조회
- [ ] 오류 문의용 `X-Request-Id` 보관
- [ ] 실제 고객사 origin을 CORS allowlist에 전달

## 15. 아직 남아 있는 오픈 전 조건

middleware 및 core의 코드와 mock provider 흐름은 구현됐지만, 실제 온라인 결제 오픈에는 다음 조건이 남아 있습니다.

1. 두 기능 브랜치를 각 저장소의 `main`에 병합하거나 PR로 반영
2. Staging Supabase에 신규 payment/refund/reconciliation migration 적용
3. 고객사 Staging origin을 `CUSTOMER_WEB_ORIGINS`에 설정
4. 고객사 웹에서 Supabase JWT 연동 및 전체 Checkout UI 구현
5. Moneris merchant QA credential 발급
6. QA에서 승인, 거절, timeout, callback 유실, 금액/order 불일치 검증
7. merchant 계정의 정확한 Refund API 계약 확인
8. production 저액 Purchase 및 Refund rehearsal

현재 Moneris Refund adapter는 merchant QA 계약이 확인되기 전까지 의도적으로 fail-closed로 동작합니다. 이 경우 예약은 취소되지만 환불 상태는 `review_required`가 되며, 실제 환불 성공으로 표시되지 않습니다.

따라서 Moneris QA credential과 Refund 계약 검증이 끝나기 전에는 Production provider를 `moneris`로 전환하면 안 됩니다.

## 16. 관련 문서

- 상세 고객사 API 명세: `docs/customer-site-screen-golf-api-spec-ko.md`
- middleware 운영 문서: `docs/operations/screen-golf-checkout.md`
- 구현 설계: `docs/superpowers/specs/2026-07-14-screen-golf-moneris-checkout-design.md`
- 고객사용 OpenAPI: `GET /api/v1/openapi.json`
