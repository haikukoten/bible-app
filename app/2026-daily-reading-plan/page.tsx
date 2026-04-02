import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import planData from "@/data/plan-2026.json";

export const metadata: Metadata = {
  title: '2026 每日读经表 - Bible Reading Plan',
  description: '2026 每日读经表 (2026 Daily Bible Reading Plan). 遵循2026年每日读经计划，每日阅读指定的圣经经文。',
  keywords: ['2026 每日读经表', 'Bible reading plan', '每日读经', '2026', '圣经'],
};

export default function DailyReadingPlan2026() {
  return (
    <section className="w-full py-8 md:py-12 lg:py-16 bg-background">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary drop-shadow-sm">
            2026 每日读经表
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium">
            按照2026年每日读经表，每天阅读圣经，伴随神的话语成长。点击经文即可跳转到线上阅读。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {planData.map((dayItem) => (
            <Card key={`day-${dayItem.day}`} className="shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-t-4 border-t-primary/80">
              <CardHeader className="bg-muted/30 pb-3 p-4">
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                  <span>Day {dayItem.day}</span>
                  <span className="text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">3 readings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-4 bg-card">
                <ul className="space-y-3">
                  {dayItem.readings.map((reading, idx) => {
                    return (
                      <li key={idx} className="group flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2 group-hover:bg-primary transition-colors"></div>
                        <Link 
                          href={`/bible?version=zh_cuv&book=${encodeURIComponent(reading.book)}&chapter=${encodeURIComponent(reading.chapter)}`}
                          className="text-foreground hover:text-primary hover:underline font-medium text-[15px] transition-colors"
                        >
                          {reading.display}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
