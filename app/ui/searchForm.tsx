'use client';

import { MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import { useFormState } from 'react-dom';
import { PoiResponse} from '@/app/lib/definitions';
import Image from 'next/image';

export default function SearchForm({handleSearch} :
    {handleSearch: (prevState: string | undefined, formData: FormData) =>
        Promise<{
            message: string;
            data: PoiResponse | undefined;
        }>
    }) {
        //@ts-ignore
    const [state, dispatch] = useFormState(handleSearch, { message: null, data: undefined});

    return (
        <>
        <section className="flex w-full h-24 bg-gray-300">
            <form className="p-7 flex flex-row justify-between items-center" action={dispatch}>
                <div className="flex relative justify-end items-center">
                    <input type="text" id="poiSearch" name="poiSearch" className="bg-white focus:outline-none py-2 pl-2 pr-10 w-80 text-black" placeholder="POI Search" />
                    <MagnifyingGlassIcon className="h-6 w-6 text-black absolute mr-3" />
                </div>
                <button className="flex rounded bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-3" id="searchButton" type="submit">Search</button>
            </form>
            {state.data && <span className="text-md text-black mt-3">
                <ul className="">
                    <li className="">Place ID: {state.data.placeId}</li>
                    <li className="">Name: {state.data.displayName}</li>
                    <li className="">Rating: {state.data.rating}</li>
                </ul>
            </span>}
        </section>
        {state.data && <section className="flex flex-wrap content-center justify-center mt-5">
            <div className="grid grid-cols-2 gap-3">
                {state.data.photos.map(photo => (
                    <div className="w-80 bg-white p-3 text-black text-sm" key={photo.name}>
                        <Image width={photo.width} height={photo.height} unoptimized loading='eager' src={photo.photoUri} className="hover:scale-[200%]" alt="" />
                        <ul className="mt-3 flex flex-wrap content-center justify-center">
                            <li className="mr-2 flex text-gray-400 hover:text-gray-600">
                                w: {photo.width} px
                            </li>
                            <li className="mr-2 flex text-gray-400 hover:text-gray-600">
                                h: {photo.height} px
                            </li>
                        </ul>
                    </div>
                ))}
            </div>
        </section>}
        </>
    );
}