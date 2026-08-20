import PricingSection from "@/components/PricingSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FEATURES, HOW_IT_WORKS_STEPS, SITE_STATS } from "@/lib/data";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Clock, Flame, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { has } = await auth();
  const subscriptionTier = has({ plan: "pro" }) ? "pro" : "free";
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
     <section className="relative pt-32 pb-32 px-4 min-h-[750px] flex items-center">
        <div className="max-w-7xl mx-auto w-full relative flex items-center">
          
    
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-full md:w-[60%] h-[550px] rounded-[2.5rem] overflow-hidden shadow-2xl">
            <Image
              src="/dish1.png"
              alt="Delicious pasta dish"
              width={1000}
              height={800}
              className="w-full h-full object-cover"
              priority
            />
            
            <Card className="absolute bottom-6 right-6 w-[calc(100%-3rem)] md:w-[360px] bg-white/90 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl py-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-2">
                    <h3 className="font-bold text-sm leading-tight text-stone-900">
                      Warm Baby Potatoes & Broccoli with Olive Oil Hummus
                    </h3>
                    <div className="flex gap-1 mt-1.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-burntOrange-500 text-burntOrange-500" />
                      ))}
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 shadow-none font-bold text-[10px] px-2 py-0.5 shrink-0">
                    98% MATCH
                  </Badge>
                </div>
                <div className="flex gap-4 text-xs text-stone-600 font-medium mt-3">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 25 mins</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3 h-3" /> 2 servings</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="relative z-10 w-full md:w-[50%] mt-40 md:mt-0 bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white">
            <Badge
              variant="outline"
              className="border-burntOrange-200 text-burntOrange-700 bg-white shadow-sm text-xs font-bold uppercase tracking-wide mb-8 px-4 py-1.5"
            >
              <Flame className="mr-2 w-4 h-4" />
              #1 AI Cooking Assistant
            </Badge>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-[1.1] tracking-tight text-stone-900">
              Your Next <br className="hidden md:block" />
              <span className="italic text-burntOrange-600 underline decoration-4 underline-offset-8">
                Favorite Meal
              </span>{" "}
              <br className="hidden md:block" />
              Is Already in Your Fridge.
            </h1>

            <p className="text-lg md:text-xl text-stone-600 mb-10 font-light leading-relaxed max-w-md">
              Snap a photo of your fridge. We&apos;ll tell you what to cook.
              Save money, reduce waste, and eat better tonight.
            </p>

            <Link href="/dashboard">
              <Button size="xl" className="bg-burntOrange-600 hover:bg-burntOrange-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-burntOrange-600/20 transition-all hover:scale-[1.02]">
                Start Cooking Free <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>

            <p className="mt-8 text-sm text-stone-500 flex items-center gap-2">
              <span className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white"></span>
                <span className="w-8 h-8 rounded-full bg-stone-300 border-2 border-white"></span>
              </span>
              <span className="font-bold text-stone-900">10k+ cooks</span> joined last month
            </p>
          </div>

        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y-2 border-stone-900 bg-stone-900">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-4">
          {SITE_STATS.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-bold mb-1 text-stone-50">
                {stat.val}
              </div>
              <Badge
                variant="secondary"
                className="bg-transparent text-burntOrange-500 text-sm uppercase
                 tracking-wider font-medium border-none"
              >
                {stat.label}
              </Badge>
            </div>
          ))}
        </div>
      </section>

       {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              Your Smart Kitchen
            </h2>
            <p className="text-stone-600 text-xl font-light">
              Everything you need to master your meal prep.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-2 border-stone-200 bg-white hover:border-burntOrange-600 hover:shadow-lg transition-all group py-0"
                >
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="border-2 border-stone-200 bg-burntOrange-50 p-3 group-hover:border-burntOrange-600 group-hover:bg-burntOrange-100 transition-colors">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs font-mono bg-stone-100 text-stone-600 uppercase tracking-wide border border-stone-200"
                      >
                        {feature.limit}
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-stone-600 text-lg font-light">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 border-y-2 border-stone-200 bg-stone-900 text-stone-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-16">
            Cook in 3 Steps
          </h2>

          <div className="space-y-12">
            {HOW_IT_WORKS_STEPS.map((item, i) => (
              <div key={i}>
                <div className="flex gap-6 items-start">
                  <Badge
                    variant="outline"
                    className="text-6xl font-bold text-burntOrange-500 border-none bg-transparent p-0 h-auto"
                  >
                    {item.step}
                  </Badge>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className="text-lg text-stone-400 font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
                {i < HOW_IT_WORKS_STEPS.length - 1 && (
                  <hr className="my-8 bg-stone-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Now Using Component */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <PricingSection subscriptionTier={subscriptionTier} />
        </div>
      </section>

    </div>
  );

}
