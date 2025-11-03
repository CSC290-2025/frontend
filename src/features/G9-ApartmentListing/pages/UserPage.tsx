import UserCard from '../../G9-ApartmentListing/components/UserCard';

export default function UserPage() {
  const id = 1; // example only in real website might use useParams instaed
  if (!id) {
    return <div> no user id provided</div>;
  }
  return (
    <div>
      <h1>User Page</h1>
      <h2>Welcome</h2>
      <UserCard id={1} />
    </div>
  );
}
