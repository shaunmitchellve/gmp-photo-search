export type textPlacesResponse = {
    places: {
        id: string,
        displayName: {text: string, languageCode: string},
        rating: number,
        photos: {
            name: string,
            widthPx: number,
            heightPx: number,
            authorAttributions: {
                displayName: string,
                uri: string,
                photoUri: string
            }
        }[]
}   []
}
  
export type photoResponse = {
    name: string,
    photoUri: string,
    height?: number,
    width?: number
};

export type PoiResponse = {
    placeId: string,
    displayName: string,
    rating: number,
    photos: photoResponse[]
}

export type HandleSearch<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>

export type HandleState = { message: string; data: PoiResponse } | undefined
  