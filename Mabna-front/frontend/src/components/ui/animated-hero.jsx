import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

function Hero({ onGetStarted }) {
  const [titleNumber, setTitleNumber] = useState(0);
  const firstLine = useMemo(
    () => ["ما", "همکاری", "زیبایی", "اثرگذاری", "کامل شدن", "بهتر شدن"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === firstLine.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, firstLine]);

  return (
    <div className="w-full bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              پلتفرم مدیریت برنامه‌ریزی <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-bold">
              {/* First Line - Static */}
              <div className="text-foreground mb-4">
                مبنا برای
              </div>
              
              {/* Second Line - Animated words */}
              <div className="relative w-full flex justify-center" style={{ minHeight: '1.2em' }}>
                {firstLine.map((word, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              پلتفرمی برای مدیریت اهداف و نتایج کلیدی (OKR) که به تیم شما کمک می‌کند 
              تا برنامه‌ریزی دقیق‌تر و اجرای بهتری داشته باشید. با مبنا، اهداف خود را 
              به واقعیت تبدیل کنید.
            </p>
          </div>
          
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" onClick={onGetStarted}>
              شروع کنید <MoveRight className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4" variant="outline" onClick={onGetStarted}>
              ورود / ثبت‌نام <LogIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
