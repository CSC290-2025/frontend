import { CleanAirOverviewCard } from '@/features/clean-air';
import { CleanAirButtonToDetail } from '@/features/clean-air';

const OverviewPage = () => {
  return (
    <div>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-5">
        <CleanAirButtonToDetail />
      </div>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
        <CleanAirOverviewCard />
      </div>
    </div>
  );
};

export default OverviewPage;
