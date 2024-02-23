import { Client } from 'undici'
import SearchForm from '@/app/ui/searchForm';
import { z } from 'zod';
import { textPlacesResponse, photoResponse, PoiResponse } from '@/app/lib/definitions';

async function getPhotos(dest: string) {
  if (!process.env.google_maps_api) {
    throw new Error('Missing Google Maps API key')
  }

  const client = new Client('https://places.googleapis.com');

  const apiBody = JSON.stringify({
    textQuery: `iconic places ${dest}`,
    includedType: 'tourist_attraction',
    minRating: '4.0'
  });

  let places, photos;
  let poiResponse: PoiResponse = {
    placeId: '',
    displayName: '',
    rating: 0,
    photos: []
  }

  try {
    const { statusCode, body } = await client.request({
      path: '/v1/places:searchText',
      method: 'POST',
      body: apiBody,
      headers: {
            'Content-Type': 'application/json',
            'Content-Length': apiBody.length.toString(),
            'X-Goog-Api-Key': process.env.google_maps_api,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.photos'
      }
    });
  
    if (statusCode !== 200) {
      throw new Error('Fetching Places Text Search failed (' + statusCode + ')');
    }

    const response = await body.json() as textPlacesResponse;
    
    if (!response.places || response.places.length === 0) {
      throw new Error('No places found.');
    }
    
    places = (response.places.length > 1) ? response.places.sort( (a,b) => b.rating - a.rating) : response.places;

  } catch (err) {
    console.error(err);
    client.close();
    return poiResponse;
  }
  poiResponse.placeId = places[0].id
  poiResponse.displayName = places[0].displayName.text;
  poiResponse.rating = places[0].rating;

  if (!places[0].photos) return poiResponse;

  const topPhotos = places[0].photos.sort( (a, b) => (b.widthPx * b.heightPx) - (a.widthPx * a.heightPx) );

  try {
    let i = 0;

    for (const topPhoto of topPhotos) {
      if (i > 2) break;

      const maxHeightpx = topPhoto.heightPx > 4800 ? 4800 : topPhoto.heightPx;
      const photoUrl = `/v1/${topPhoto.name}/media?key=${process.env.google_maps_api}&maxHeightPx=${maxHeightpx}`;

      const { statusCode, body } = await client.request({
        path: photoUrl,
        method: 'GET',
      });

      if (statusCode !== 200 && statusCode !== 302) {
        throw new Error('Fetching Places Photos failed(' + statusCode + ')');
      }

      const response = await body.json() as photoResponse;
      response.height = topPhoto.heightPx;
      response.width = topPhoto.widthPx;
      poiResponse.photos.push(response);
      ++i;
    }

    client.close();

    return poiResponse;
  } catch (err) {
    console.error(err);
    client.close();
    return;
  }
}

async function handleSearch(prevState: string | undefined, formData: FormData) {
  'use server'

  const poiSearchSchema = z.string();

  const poiValidation = poiSearchSchema.safeParse(formData.get('poiSearch'))

  if (poiValidation.success) {
    const poi = await getPhotos(poiValidation.data);
    
   return {
    message: 'success',
    data: poi
   }
  } else {
    return {
      message: 'error',
      data: undefined
    }
  }

}

export default async function Page() {

  return (
    <main className="felx w-full h-full flex-col">
      <div className="flex w-full h-full flex-col">
        <SearchForm handleSearch={handleSearch} />
      </div>
    </main>
  )
}
