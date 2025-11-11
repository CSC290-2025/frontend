import { useGetMetroCardsUserUserId } from '@/api/generated/metro-cards';
import { useParams } from '@/router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function MetroCardPage() {
  const { id } = useParams('/financial/metro/:id');

  const { data: metroCardResponse } = useGetMetroCardsUserUserId(Number(id));

  const metroCards = metroCardResponse?.data?.data.metroCards;

  if (!id) {
    return <div> no user id provided</div>;
  }
  return (
    <div className="p-4">
      <h1 className="mb-4">Metro Card</h1>
      <div className="grid gap-4">
        {metroCards?.map((metroCard) => (
          <Card key={metroCard.card_number}>
            <CardHeader>
              <CardTitle>Number : {metroCard?.card_number}</CardTitle>
              <CardDescription>
                user Id : {id} (will later change it to user&apos;s name)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <span className="font-bold">Status</span> :{' '}
                <span className="text-green-600">{metroCard?.status}</span>
              </p>
            </CardContent>
            <CardFooter>
              <p>
                <span className="font-bold">Balance :</span> $
                {metroCard?.balance}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
