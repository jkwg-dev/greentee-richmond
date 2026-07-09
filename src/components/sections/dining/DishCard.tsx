import { PhotoFrame } from "@/components/ui/PhotoFrame";
import { DISH_CATEGORY_LABEL, type Dish } from "@/types";

/**
 * Menu dish card (docs §8.3 menu item 2, mockup `.dish`): large-format photo
 * slot, jade category label, EN name over the 中文 name in the system zh stack
 * (§2.2), and one line.
 */
export function DishCard({ dish }: { dish: Dish }) {
  return (
    <>
      <PhotoFrame
        tint={dish.frame.tint}
        label={{ kicker: "Large-format photo", name: dish.name }}
        className="mb-5 aspect-[16/10]"
      />
      <p className="text-jade-text mb-2.5 text-[8.5px] leading-none font-medium tracking-[0.3em] uppercase">
        {DISH_CATEGORY_LABEL[dish.category]}
      </p>
      <h3 className="font-serif text-[23px] leading-[1.25] font-medium">
        {dish.name}
      </h3>
      <p
        lang="zh"
        className="font-zh text-champagne-bright/85 mt-[5px] mb-2 text-[13px] leading-[1.4] tracking-[0.12em]"
      >
        {dish.zhName}
      </p>
      <p className="text-mist max-w-[420px] text-[12.5px] leading-[1.8]">
        {dish.line}
      </p>
    </>
  );
}
