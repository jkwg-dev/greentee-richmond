# 고객사 자체 사이트용 Screen Golf 예약 API Spec

작성일: 2026-07-03  
문서 버전: v0.1  
대상: 고객사 자체 웹사이트/프론트엔드/백엔드 개발자  
기준 코드: `web-server` middleware의 screen golf proxy API

## 1. 개요

이 문서는 고객사의 자체 웹사이트에서 Green Tee middleware를 통해 screen golf 예약 기능을 붙이기 위한 API 명세입니다.

전체 구조는 다음과 같습니다.

```text
고객사 자체 사이트
  -> Green Tee middleware API
    -> screen_golf_web Public API
      -> Supabase/Postgres 예약 데이터
```

고객사 사이트는 `screen_golf_web`을 직접 호출하지 않습니다. 고객사 사이트는 Green Tee middleware만 호출하고, middleware가 서버 환경변수 `SCREEN_GOLF_API_KEY`를 사용해 `screen_golf_web`에 요청합니다. 따라서 `sgsk_...` 형식의 screen golf API key는 브라우저나 고객사 코드에 노출하지 않습니다.

## 2. 현재 API 범위와 중요 제약

현재 middleware에서 제공하는 screen golf API 범위는 다음과 같습니다.

- 방 목록 조회
- 가격/rate plan 조회
- 예약 가능 시간 조회
- 로그인 사용자와 screen golf 사용자 연결
- 예약 생성
- 내 예약 목록/상세 조회
- 내 예약 취소

현재 범위 밖이지만 운영 전 의사결정이 필요한 항목:

- 고객사 자체 사이트가 Green Tee/Supabase 사용자 토큰을 어떻게 받을지 결정해야 합니다.
- 현재 middleware API는 사용자별 Supabase JWT 기반입니다. 별도 server-to-server 공개 API key 방식은 아직 없습니다.
- 현재 middleware에는 payment intent 생성 또는 결제 확정 endpoint가 없습니다. 예약 생성은 screen golf 예약 row/hold 생성까지 담당합니다.
- 클라이언트가 직접 전달하는 idempotency key는 아직 지원하지 않습니다. 네트워크 타임아웃 후 같은 예약 생성을 무조건 재시도하지 말고, 먼저 내 예약 목록을 조회해 생성 여부를 확인해야 합니다.

## 3. Base URL

환경별 base URL은 배포 후 확정값으로 교체해 주세요.

```text
Production: https://<middleware-production-domain>
Staging:    https://<middleware-staging-domain>
Local:      http://localhost:3000
```

이 문서의 예시는 다음 placeholder를 사용합니다.

```text
BASE_URL=https://api.example.com
```

## 4. 인증

모든 `/api/v1/simulator/*` endpoint와 `/api/v1/pricing` endpoint는 Supabase JWT가 필요합니다.

```http
Authorization: Bearer <supabase_access_token>
```

middleware는 JWT를 Supabase JWKS로 검증하고, 토큰의 `sub` claim을 사용자 ID로 사용합니다. 이 값은 내부적으로 screen golf API의 `external_user_id`가 됩니다.

예약 생성 시에는 토큰에 `email` claim이 있어야 합니다. email이 없으면 `422 VALIDATION_FAILED`가 반환됩니다.

현재 middleware가 screen golf API에 전달하는 외부 provider 값은 고정입니다.

```text
externalProvider = green_tee_flutter
externalUserId   = Supabase JWT sub
email            = Supabase JWT email
```

고객사 자체 사이트가 Supabase Auth를 직접 사용하지 않는 구조라면, 운영 전 다음 중 하나를 별도 구현해야 합니다.

- 고객사 사이트에서 Green Tee/Supabase 로그인 세션을 사용한다.
- 고객사 백엔드와 Green Tee middleware 사이의 server-to-server 인증 endpoint를 새로 만든다.
- 기존 고객 계정을 Supabase 사용자와 매핑하는 token exchange flow를 새로 만든다.

## 5. 공통 헤더

요청 공통 헤더:

```http
Authorization: Bearer <supabase_access_token>
Accept: application/json
Content-Type: application/json
```

`GET` 요청은 `Content-Type`이 없어도 됩니다.

선택적으로 `x-request-id`를 전달할 수 있습니다. 전달하지 않으면 middleware가 UUID를 생성합니다. 응답에도 같은 `x-request-id`가 포함됩니다.

```http
x-request-id: 018f6b94-0dc0-7331-98da-8bf57b967abc
```

## 6. 공통 데이터 규칙

### 6.1 필드 이름

고객사 사이트가 호출하는 middleware API는 JSON 필드를 `camelCase`로 반환합니다.

예:

```json
{
  "roomId": "00000000-0000-0000-0000-000000000001",
  "startsAt": "2026-07-10T18:00:00-07:00",
  "priceCents": 9000
}
```

참고로 `screen_golf_web` 원본 API는 `snake_case`를 사용하지만, middleware가 변환합니다.

### 6.2 날짜와 시간

날짜 query parameter는 `YYYY-MM-DD` 형식입니다.

```text
date=2026-07-10
```

`startsAt`, `endsAt`, `createdAt`, `cancelledAt`, `expiresAt`은 ISO 8601 문자열입니다. 가능 시간 조회 응답의 `startsAt`, `endsAt`에는 timezone offset이 포함됩니다.

```text
2026-07-10T18:00:00-07:00
```

예약 생성 시에는 가능 시간 조회에서 받은 `startsAt`, `endsAt` 값을 그대로 사용하세요. 클라이언트에서 임의로 시간 문자열을 재계산하지 않는 것을 권장합니다.

### 6.3 금액

금액은 모두 정수 cent 단위입니다.

```text
9000 = CAD 90.00
```

현재 currency는 `CAD`입니다.

## 7. 추천 예약 플로우

고객사 사이트에서 일반적인 예약 UI를 만들 때 권장하는 순서입니다.

1. 사용자를 인증하고 Supabase access token을 확보합니다.
2. `GET /api/v1/simulator/rooms`로 방 목록을 가져옵니다.
3. 필요하면 `GET /api/v1/pricing`으로 rate plan과 가격 규칙을 가져옵니다.
4. 사용자가 날짜, 인원, 선택 방을 고르면 `GET /api/v1/simulator/availability`를 호출합니다.
5. 사용자가 slot을 선택하면 slot의 `roomId`, `startsAt`, `endsAt`, `partySize`로 `POST /api/v1/simulator/reservations`를 호출합니다.
6. 생성 결과의 `id`, `reservationCode`, `status`, `expiresAt`, 금액 필드를 화면에 표시합니다.
7. 내 예약 화면은 `GET /api/v1/simulator/reservations`로 구성합니다.
8. 취소는 `POST /api/v1/simulator/reservations/{id}/cancel`을 호출합니다.

## 8. Endpoint 요약

| Method | Path | Auth | 설명 |
| --- | --- | --- | --- |
| GET | `/health` | 없음 | middleware health check |
| GET | `/api/v1/simulator/rooms` | Supabase JWT | screen golf 방 목록 |
| GET | `/api/v1/pricing` | Supabase JWT | rate plan, 가격 규칙, 세금 설정 |
| GET | `/api/v1/simulator/availability` | Supabase JWT | 예약 가능 시간 조회 |
| POST | `/api/v1/simulator/reservations` | Supabase JWT | 예약 생성 |
| GET | `/api/v1/simulator/reservations` | Supabase JWT | 로그인 사용자의 예약 목록 |
| GET | `/api/v1/simulator/reservations/{id}` | Supabase JWT | 로그인 사용자의 예약 상세 |
| POST | `/api/v1/simulator/reservations/{id}/cancel` | Supabase JWT | 로그인 사용자의 예약 취소 |

## 9. Endpoint 상세

### 9.1 Health Check

```http
GET /health
```

인증은 필요 없습니다.

응답 예시:

```json
{
  "ok": true,
  "time": "2026-07-03T16:30:00.000Z",
  "requestId": "018f6b94-0dc0-7331-98da-8bf57b967abc",
  "services": {
    "courseBookingEnabled": false,
    "screenGolfConfigured": true
  }
}
```

`screenGolfConfigured`가 `false`이면 middleware에 `SCREEN_GOLF_API_URL` 또는 `SCREEN_GOLF_API_KEY`가 설정되지 않은 상태입니다.

### 9.2 방 목록 조회

```http
GET /api/v1/simulator/rooms
```

활성화된 screen golf 방 목록을 반환합니다.

요청 예시:

```bash
curl "$BASE_URL/api/v1/simulator/rooms" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

응답 예시:

```json
{
  "rooms": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "Bay 1",
      "ratePlanId": "00000000-0000-0000-0000-000000000101",
      "displayOrder": 1,
      "minCapacity": 1,
      "maxCapacity": 4,
      "description": {
        "en": "TrackMan bay"
      },
      "photoUrls": [
        "https://example.com/bay-1.jpg"
      ]
    }
  ]
}
```

필드:

| Field | Type | 설명 |
| --- | --- | --- |
| `id` | string UUID | 방 ID |
| `name` | string | 방 이름 |
| `ratePlanId` | string UUID | 이 방에 적용되는 rate plan ID |
| `displayOrder` | number | 화면 표시 순서 |
| `minCapacity` | number | 최소 인원 |
| `maxCapacity` | number | 최대 인원 |
| `description` | object | locale별 설명 |
| `photoUrls` | string[] | 방 사진 URL 목록 |

### 9.3 가격/rate plan 조회

```http
GET /api/v1/pricing
```

방별 가격 프리셋과 가격 규칙을 반환합니다. 예약 가능 시간 응답에는 이미 각 slot의 최종 `priceCents`가 들어 있으므로, 이 endpoint는 가격표 UI나 디버깅/사전 표시용으로 사용하면 됩니다.

요청 예시:

```bash
curl "$BASE_URL/api/v1/pricing" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

응답 예시:

```json
{
  "currency": "CAD",
  "ratePlans": [
    {
      "id": "00000000-0000-0000-0000-000000000101",
      "name": "Premium",
      "description": "Premium bays",
      "isDefault": false
    }
  ],
  "rules": [
    {
      "ratePlanId": "00000000-0000-0000-0000-000000000101",
      "ruleType": "weekday_peak",
      "priceCents": 9000,
      "effectiveFrom": "2026-01-01",
      "effectiveTo": null
    }
  ],
  "peakHours": {
    "weekday": {
      "start": "17:00",
      "end": "21:00"
    },
    "weekend": {
      "start": "10:00",
      "end": "20:00"
    }
  },
  "tax": {
    "stripeTaxEnabled": false,
    "gstPercent": 5,
    "pstPercent": 7
  }
}
```

`ruleType` 값:

| Value | 의미 |
| --- | --- |
| `weekday_offpeak` | 평일 일반 시간 |
| `weekday_peak` | 평일 peak 시간 |
| `weekend_offpeak` | 주말 일반 시간 |
| `weekend_peak` | 주말 peak 시간 |

### 9.4 예약 가능 시간 조회

```http
GET /api/v1/simulator/availability?date={YYYY-MM-DD}&partySize={number}&roomId={uuid}
```

선택 날짜와 인원에 대해 예약 가능한 slot을 반환합니다.

Query parameters:

| Parameter | Required | Type | 제한 |
| --- | --- | --- | --- |
| `date` | yes | string | `YYYY-MM-DD` |
| `partySize` | yes | integer | 1 이상 20 이하 |
| `roomId` | no | string UUID | 특정 방만 조회할 때 사용 |

요청 예시:

```bash
curl "$BASE_URL/api/v1/simulator/availability?date=2026-07-10&partySize=2&roomId=00000000-0000-0000-0000-000000000001" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

응답 예시:

```json
{
  "date": "2026-07-10",
  "slots": [
    {
      "roomId": "00000000-0000-0000-0000-000000000001",
      "roomName": "Bay 1",
      "startsAt": "2026-07-10T18:00:00-07:00",
      "endsAt": "2026-07-10T18:30:00-07:00",
      "priceCents": 9000,
      "currency": "CAD"
    }
  ],
  "reasons": []
}
```

`slots`가 빈 배열일 수 있습니다. 이때 `reasons`로 운영/설정상 이유를 일부 확인할 수 있습니다.

| Reason | 의미 |
| --- | --- |
| `closed_today` | 해당 날짜가 휴무이거나 영업시간 설정상 닫혀 있음 |
| `no_rooms` | 조건에 맞는 활성 방이 없음 |
| `no_pricing_configured` | 유효한 가격 규칙이 전혀 없음 |
| `pricing_gaps` | 일부 시간대/방/rate plan의 가격 규칙이 누락됨 |

이미 예약이 찼거나 당일 마감 시간 정책 때문에 slot이 없는 경우에는 `reasons`가 빈 배열일 수도 있습니다.

### 9.5 예약 생성

```http
POST /api/v1/simulator/reservations
```

로그인 사용자와 screen golf 사용자를 연결한 뒤 예약을 생성합니다. middleware는 토큰의 `sub`와 `email`을 사용해 내부적으로 `/users/link`를 먼저 호출합니다.

요청 body:

| Field | Required | Type | 제한 |
| --- | --- | --- | --- |
| `roomId` | yes | string UUID | availability slot의 `roomId` 사용 |
| `startsAt` | yes | ISO datetime with offset | availability slot의 `startsAt` 사용 |
| `endsAt` | yes | ISO datetime with offset | availability slot의 `endsAt` 사용 |
| `partySize` | yes | integer | 1 이상 20 이하 |
| `customerNotes` | no | string | 최대 500자 |

요청 예시:

```bash
curl -X POST "$BASE_URL/api/v1/simulator/reservations" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "roomId": "00000000-0000-0000-0000-000000000001",
    "startsAt": "2026-07-10T18:00:00-07:00",
    "endsAt": "2026-07-10T18:30:00-07:00",
    "partySize": 2,
    "customerNotes": "Window bay if possible"
  }'
```

성공 응답:

```http
201 Created
```

```json
{
  "id": "00000000-0000-0000-0000-000000000099",
  "reservationCode": "SG-2026-000123",
  "status": "pending",
  "roomId": "00000000-0000-0000-0000-000000000001",
  "startsAt": "2026-07-10T18:00:00-07:00",
  "endsAt": "2026-07-10T18:30:00-07:00",
  "partySize": 2,
  "currency": "CAD",
  "subtotalCents": 9000,
  "gstCents": 450,
  "pstCents": 630,
  "totalCents": 10080,
  "refundCents": 0,
  "expiresAt": "2026-07-10T17:50:00-07:00",
  "externalUserId": "supabase-user-id",
  "customerNotes": "Window bay if possible",
  "createdAt": "2026-07-03T16:30:00.000Z",
  "cancelledAt": null
}
```

중요:

- `status`는 `pending`, `confirmed`, `cancelled`, `no_show`, `completed` 중 하나입니다.
- 현재 middleware에는 결제 확정 endpoint가 없습니다. 결제/확정까지 고객사 자체 사이트에서 처리해야 한다면 별도 API 확장이 필요합니다.
- 동일 slot을 다른 사용자가 먼저 잡으면 `409 CONFLICT`가 반환될 수 있습니다.
- 네트워크 타임아웃이 발생하면 같은 요청을 즉시 반복하지 말고, 먼저 `GET /api/v1/simulator/reservations`로 예약 생성 여부를 확인하세요.

### 9.6 내 예약 목록 조회

```http
GET /api/v1/simulator/reservations?status={status}&cursor={isoDateTime}&limit={number}
```

로그인 사용자에게 연결된 screen golf 예약 목록을 반환합니다.

Query parameters:

| Parameter | Required | Type | 제한 |
| --- | --- | --- | --- |
| `status` | no | string | 권장값: `pending`, `confirmed`, `cancelled`, `no_show`, `completed` |
| `cursor` | no | ISO datetime with offset | 다음 페이지 조회용 |
| `limit` | no | integer | 1 이상 100 이하 |

요청 예시:

```bash
curl "$BASE_URL/api/v1/simulator/reservations?status=pending&limit=20" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

응답 예시:

```json
{
  "reservations": [
    {
      "id": "00000000-0000-0000-0000-000000000099",
      "reservationCode": "SG-2026-000123",
      "status": "pending",
      "roomId": "00000000-0000-0000-0000-000000000001",
      "startsAt": "2026-07-10T18:00:00-07:00",
      "endsAt": "2026-07-10T18:30:00-07:00",
      "partySize": 2,
      "currency": "CAD",
      "subtotalCents": 9000,
      "gstCents": 450,
      "pstCents": 630,
      "totalCents": 10080,
      "refundCents": 0,
      "expiresAt": "2026-07-10T17:50:00-07:00",
      "externalUserId": "supabase-user-id",
      "customerNotes": "Window bay if possible",
      "createdAt": "2026-07-03T16:30:00.000Z",
      "cancelledAt": null
    }
  ],
  "nextCursor": null
}
```

### 9.7 내 예약 상세 조회

```http
GET /api/v1/simulator/reservations/{id}
```

예약 ID가 로그인 사용자의 예약일 때만 반환됩니다.

요청 예시:

```bash
curl "$BASE_URL/api/v1/simulator/reservations/00000000-0000-0000-0000-000000000099" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

응답은 예약 객체 1개입니다. 필드 구조는 예약 생성 응답과 같습니다.

권한이 없거나 존재하지 않는 예약이면 `404 NOT_FOUND`가 반환됩니다.

### 9.8 예약 취소

```http
POST /api/v1/simulator/reservations/{id}/cancel
```

로그인 사용자의 예약만 취소할 수 있습니다. middleware는 취소 전 소유권 확인을 위해 상세 조회를 먼저 수행합니다.

요청 body는 없습니다.

요청 예시:

```bash
curl -X POST "$BASE_URL/api/v1/simulator/reservations/00000000-0000-0000-0000-000000000099/cancel" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

응답 예시:

```json
{
  "reservation": {
    "id": "00000000-0000-0000-0000-000000000099",
    "reservationCode": "SG-2026-000123",
    "status": "cancelled",
    "roomId": "00000000-0000-0000-0000-000000000001",
    "startsAt": "2026-07-10T18:00:00-07:00",
    "endsAt": "2026-07-10T18:30:00-07:00",
    "partySize": 2,
    "currency": "CAD",
    "subtotalCents": 9000,
    "gstCents": 450,
    "pstCents": 630,
    "totalCents": 10080,
    "refundCents": 10080,
    "expiresAt": "2026-07-10T17:50:00-07:00",
    "externalUserId": "supabase-user-id",
    "customerNotes": "Window bay if possible",
    "createdAt": "2026-07-03T16:30:00.000Z",
    "cancelledAt": "2026-07-03T16:40:00.000Z"
  },
  "refundCents": 10080,
  "refundPercent": 100
}
```

취소 정책은 `screen_golf_web`의 refund policy에 따릅니다. `pending` 예약은 고객 관점에서 결제 capture 전이므로 일반적으로 100% 환불로 계산됩니다.

## 10. Error Response

middleware error response는 기본적으로 다음 형태입니다.

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": []
  }
}
```

주요 status/code:

| HTTP | Code | 발생 상황 |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` 또는 validator error | query/body 형식 오류 |
| 401 | `UNAUTHORIZED` | bearer token 누락, 만료, 검증 실패 |
| 403 | `FORBIDDEN` | upstream 권한 오류 |
| 404 | `NOT_FOUND` | 예약/방을 찾을 수 없거나 소유자가 아님 |
| 409 | `CONFLICT` | 이미 예약된 slot 등 충돌 |
| 422 | `VALIDATION_FAILED` | business rule 위반, email claim 누락 등 |
| 500 | `INTERNAL_ERROR` | middleware 또는 upstream 예기치 못한 오류 |

인증 실패 예시:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing bearer token"
  }
}
```

충돌 예시:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Slot is no longer available"
  }
}
```

## 11. TypeScript 타입 참고

고객사 프론트엔드가 TypeScript를 사용한다면 아래 타입을 기준으로 구현할 수 있습니다.

```ts
export type ScreenGolfRoom = {
  id: string;
  name: string;
  ratePlanId: string;
  displayOrder: number;
  minCapacity: number;
  maxCapacity: number;
  description: Record<string, string>;
  photoUrls: string[];
};

export type ScreenGolfSlot = {
  roomId: string;
  roomName: string;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  currency: string;
};

export type ScreenGolfAvailability = {
  date: string;
  slots: ScreenGolfSlot[];
  reasons: string[];
};

export type ScreenGolfReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'no_show'
  | 'completed';

export type ScreenGolfReservation = {
  id: string;
  reservationCode: string;
  status: ScreenGolfReservationStatus;
  roomId: string;
  startsAt: string;
  endsAt: string;
  partySize: number;
  currency: string;
  subtotalCents: number;
  gstCents: number;
  pstCents: number;
  totalCents: number;
  refundCents: number;
  expiresAt: string | null;
  externalUserId: string | null;
  customerNotes: string | null;
  createdAt: string;
  cancelledAt: string | null;
};

export type ScreenGolfPricing = {
  currency: string;
  ratePlans: Array<{
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean;
  }>;
  rules: Array<{
    ratePlanId: string;
    ruleType: 'weekday_offpeak' | 'weekday_peak' | 'weekend_offpeak' | 'weekend_peak';
    priceCents: number;
    effectiveFrom: string;
    effectiveTo: string | null;
  }>;
  peakHours: {
    weekday: { start: string; end: string };
    weekend: { start: string; end: string };
  };
  tax: {
    stripeTaxEnabled: boolean;
    gstPercent: number;
    pstPercent: number;
  };
};
```

## 12. 프론트엔드 구현 주의사항

- slot 선택 후 예약 생성 전까지 availability를 오래 캐싱하지 마세요. 다른 사용자가 같은 slot을 먼저 예약할 수 있습니다.
- 예약 생성 직전에 최신 availability를 다시 확인하거나, `409 CONFLICT`를 받으면 availability를 새로고침하세요.
- 예약 생성 후 화면에는 최소한 `reservationCode`, `status`, `startsAt`, `endsAt`, `roomId`, `totalCents`, `expiresAt`을 표시하세요.
- `startsAt`, `endsAt`은 서버 응답 문자열을 기준으로 표시하세요. 브라우저 locale 변환이 필요한 경우 timezone 표시 정책을 명확히 정해야 합니다.
- `priceCents`와 `totalCents`는 cent 단위입니다. 표시 시 100으로 나눠 통화 포맷을 적용하세요.
- `customerNotes`는 선택값이며 500자 이하로 제한하세요.

## 13. 운영 전 체크리스트

고객사 개발자와 연동 전에 아래 항목을 확정해야 합니다.

- Production middleware base URL
- 고객사 사이트의 인증 방식
- Supabase access token 발급/전달 방식
- 예약 생성 후 결제/확정 처리를 어디서 담당할지
- 예약 생성 실패 또는 network timeout 시 재시도 정책
- 취소/환불 정책 문구
- 고객에게 표시할 timezone과 날짜 포맷
- 고객사 사이트에서 표시할 방 사진/설명 언어
- 운영 문의용 `x-request-id` 전달 방식

## 14. 현재 추가 개발 후보

고객사 자체 사이트가 실제 운영 예약까지 완결해야 한다면 다음 API 확장을 권장합니다.

- client-provided `Idempotency-Key` 지원
- payment intent proxy endpoint
- 예약 확정 상태 조회/결제 완료 flow 문서화
- server-to-server 인증 또는 token exchange endpoint
- 고객사 사이트 전용 OpenAPI JSON export
