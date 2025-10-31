import CurrentAQICard from '../components/CurrentAqiCard';
import Summary from '../components/Summary';
import HealthTips from '../components/HealthTips';
import PollutantsCard from '../components/PollutantsCard';
import HistoricalTable from '../components/HistoricalTable';

export default function DashboardPage() {
  return (
    <div>
      <CurrentAQICard />
      <Summary />
      <HealthTips />
      <PollutantsCard />
      <HistoricalTable />
    </div>
  );
}
