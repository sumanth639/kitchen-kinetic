'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Search, Sparkles, ChefHat } from 'lucide-react';
import { SearchBarProps } from '../types';

const searchFormSchema = z.object({
  searchTerm: z
    .string()
    .min(1, 'Please enter a dish or ingredient to search for.'),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

export function SearchBar({
  onSubmit,
  loading,
  hasSearched,
  searchTerm,
}: SearchBarProps) {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm,
    },
  });

  const isButtonLoading = loading;

  return (
    <section className="relative w-full -mt-14 py-12 sm:py-16 md:py-20 lg:py-32 bg-cover bg-center bg-no-repeat overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70 backdrop-blur-sm" />
      <Image
        src="/hero-1.jpg"
        alt="Hero background"
        fill
        className="object-cover -z-10 scale-105 hover:scale-110 transition-transform duration-[20s] ease-out"
        priority
        sizes="100vw"
        data-ai-hint="food cooking"
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400/30 rounded-full animate-pulse" />
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-pink-400/40 rounded-full animate-bounce"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-yellow-400/20 rounded-full animate-pulse"
          style={{ animationDelay: '2s' }}
        />
        <ChefHat className="absolute top-1/5 right-1/4 w-8 h-8 text-white/10 animate-float" />
        <Sparkles className="absolute bottom-1/4 right-1/5 w-6 h-6 text-orange-300/20 animate-twinkle" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        {/* Enhanced Title Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm">
            <span className="text-white/90 font-medium">
              Discover Amazing Flavors
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-2 sm:mb-3 md:mb-4 tracking-tight text-white drop-shadow-2xl animate-title-glow">
            Kitchen{' '}
            <span className="relative inline-block text-primary-foreground bg-amber-600 text-gray-800 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl shadow-lg animate-gradient-shift">
              Kinetic
            </span>
          </h1>

          <p
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            Discover and share amazing recipes from around the world
          </p>
        </div>

        <div
          className="max-w-2xl mx-auto px-2 sm:px-4 animate-fade-in-up"
          style={{ animationDelay: '0.9s' }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
              <div className="flex flex-row gap-2 sm:gap-3 p-2 sm:p-1 bg-black/20 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10">
                <FormField
                  control={form.control}
                  name="searchTerm"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <div className="relative group">
                          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-gray-400 z-10 transition-colors group-focus-within:text-orange-400" />
                          <Input
                            placeholder="Search for pizza, pasta, salad..."
                            className="pl-10 sm:pl-12 pr-4 h-14 sm:h-16 text-base sm:text-lg !bg-gray-900/50 backdrop-blur-sm shadow-xl rounded-lg sm:rounded-xl transition-all duration-300 !text-white placeholder:!text-gray-400 !border-gray-700/50 focus:!border-orange-400/50 focus:!ring-2 focus:!ring-orange-500/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 mt-2 pl-2" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="h-14 w-14 sm:h-16 sm:w-auto sm:px-8 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl shadow-xl transition-all duration-300 whitespace-nowrap
                            
                             text-white border-0 hover:shadow-2xl hover:shadow-orange-500/25 hover:scale-105
                             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                  disabled={isButtonLoading}
                >
                  {isButtonLoading ? (
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 sm:h-6 sm:w-6 sm:mr-2" />
                      <span className="hidden sm:inline">Search</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div
            className="mt-4 sm:mt-6 text-center animate-fade-in-up"
            style={{ animationDelay: '1.2s' }}
          >
            <p className="text-xs sm:text-sm text-white/60 mb-2 sm:mb-3">
              Popular searches:
            </p>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2">
              {[
                'Italian Pasta',
                'Healthy Salads',
                'Quick Breakfast',
                'Pizza',
              ].map((term) => (
                <button
                  key={term}
                  className="px-2 sm:px-3 py-1 text-xs bg-white/10 hover:bg-white/20 text-white/80 rounded-full border border-white/20 transition-all duration-200 hover:scale-105 truncate"
                  onClick={() => {
                    form.setValue('searchTerm', term);
                    form.handleSubmit(onSubmit)();
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
