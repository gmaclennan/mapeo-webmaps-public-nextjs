import parseFirestore from 'firestore-parser'

const API_BASE =
  'https://firestore.googleapis.com/v1beta1/projects/mapeo-webmaps/databases/(default)/documents/'
const IMAGE_BASE =
  'https://firebasestorage.googleapis.com/v0/b/mapeo-webmaps.appspot.com/o/'

export default async function getObservations(
  userId: string,
  mapId: string
): Promise<Array<any>> {
  const url = `${API_BASE}groups/${userId}/maps/${mapId}/observations`
  const response = await fetch(url)
  if (response.status !== 200) throw new Error('Not Found')
  const data = await response.json()
  return parse(data, userId)
}

function parse(firestoreData, userId) {
  return parseFirestore(firestoreData).documents.map(function (doc) {
    const f = doc.fields
    const imageId = f.properties.image
    if (imageId) {
      f.properties.image = `${IMAGE_BASE}images%2F${userId}%2Foriginal%2F${f.properties.image}?alt=media`
    } else {
      delete f.properties.image
    }
    return f
  })
}
