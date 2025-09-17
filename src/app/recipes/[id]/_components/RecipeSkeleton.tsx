import { Skeleton } from '@/components/ui/skeleton';

export default function RecipeSkeleton() {
  
    return (
      <div className="container mx-auto px-4 pt-8 pb-6 lg:pt-12 lg:pb-8 max-w-7xl">
       
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
            
            <div className="lg:w-[45%]">
              <Skeleton className="w-full h-64 sm:h-72 lg:h-80 rounded-lg mb-6 lg:mb-0" />
            </div>

            
            <div className="mt-6 lg:mt-0 lg:flex-1 text-center lg:text-left space-y-4">
              <Skeleton className="h-10 w-3/4 mx-auto lg:mx-0" />
              <Skeleton className="h-6 w-1/2 mx-auto lg:mx-0" />
              <div className="flex justify-center lg:justify-start gap-6 pt-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton for the Ingredients and Actions/Info sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
        <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          
        
        </div>
      </div>
    );
  }

 
