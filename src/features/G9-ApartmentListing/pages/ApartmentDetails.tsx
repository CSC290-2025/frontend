// import React from 'react';
import { useParams } from '@/router';

export default function ApartmentDetails() {
  const { id } = useParams('/ApartmentHomepage/:id');
  return <div>Apartment detail for {id}</div>;
}
