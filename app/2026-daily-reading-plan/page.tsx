import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import planData from "@/data/plan-2026.json";

export const metadata: Metadata = {
  title: '2026 每日读经表 - Bible Reading Plan',
  description: '2026 每日读经表 (2026 Daily Bible Reading Plan). 遵循2026年每日读经计划，每日阅读指定的圣经经文。',
  keywords: ['2026 每日读经表', 'Bible reading plan', '每日读经', '2026', '圣经'],
};

function getMonthAndDate(day: number): { month: number; date: number } {
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let remaining = day;
  for (let month = 0; month < months.length; month++) {
    if (remaining <= months[month]) {
      return { month: month + 1, date: remaining };
    }
    remaining -= months[month];
  }
  return { month: 12, date: 31 };
}

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function DailyReadingPlan2026() {
  const groupedByMonth: { month: number; days: typeof planData }[] = [];
  
  for (let i = 0; i < planData.length; i++) {
    const dayItem = planData[i];
    const { month } = getMonthAndDate(dayItem.day);
    const existing = groupedByMonth.find(g => g.month === month);
    if (existing) {
      existing.days.push(dayItem);
    } else {
      groupedByMonth.push({ month, days: [dayItem] });
    }
  }

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
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {MONTH_NAMES.map((name, idx) => (
              <a
                key={idx}
                href={`#month-${idx + 1}`}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-full transition-colors text-sm"
              >
                {name}
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {groupedByMonth.map(({ month, days }) => (
            <div key={month} id={`month-${month}`}>
              <h2 className="text-2xl font-bold mb-4 text-primary border-b-2 border-primary/20 pb-2">
                {month} 月
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {days.map((dayItem) => (
                  <Card key={`day-${dayItem.day}`} className="shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-t-4 border-t-primary/80">
                    <CardHeader className="bg-muted/30 pb-3 p-4">
                      <CardTitle className="text-lg font-bold flex items-center justify-between">
                        <span>{(() => {
                          const { date } = getMonthAndDate(dayItem.day);
                          return `${date} 日`;
                        })()}</span>
                        <span className="text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">3 readings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-4 bg-card">
                      <ul className="space-y-3">
                        {dayItem.readings.map((reading, idx) => (
                          <li key={idx} className="group flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mr-2 group-hover:bg-primary transition-colors"></div>
                            <Link 
                              href={`/bible?version=zh_cuv&book=${encodeURIComponent(reading.book)}&chapter=${encodeURIComponent(reading.chapter)}`}
                              className="text-foreground hover:text-primary hover:underline font-medium text-[15px] transition-colors"
                            >
                              {reading.display}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
