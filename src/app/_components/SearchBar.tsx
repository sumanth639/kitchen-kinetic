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
import { Loader2, Search } from 'lucide-react';
import { SearchBarProps } from '../types';

const searchFormSchema = z.object({
  searchTerm: z.string().min(0, 'Please enter something to search for'),
});

type SearchFormData = z.infer<typeof searchFormSchema>;

export function SearchBar({ onSubmit, loading, hasSearched, searchTerm }: SearchBarProps) {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      searchTerm,
    },
  });

  return (
    <section className="relative w-full -mt-14 py-16 sm:py-20 md:py-32 bg-cover bg-center bg-no-repeat">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <Image
        src="/hero.jpg"
        alt="Hero background"
        fill
        className="object-cover -z-10"
        data-ai-hint="food cooking"
      />
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight text-white">
            Kitchen <span className="text-primary">Kinetic</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
            Discover and share amazing recipes from around the world
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <FormField
                control={form.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
                        <Input
                          placeholder="Search for pizza, pasta, salad..."
                          className="pl-10 sm:pl-12 h-12 text-sm sm:text-base bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 shadow-lg rounded-xl transition-all duration-300 text-white placeholder:text-gray-300"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 whitespace-nowrap"
                disabled={loading && hasSearched}
              >
                {loading && hasSearched ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
} 