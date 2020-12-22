import parseFirestore from 'firestore-parser'

const API_BASE =
  'https://firestore.googleapis.com/v1beta1/projects/mapeo-webmaps/databases/(default)/documents/'

export default async function getMetadata(
  userId: string,
  mapId: string
): Promise<any> {
  const url = `${API_BASE}groups/${userId}/maps/${mapId}`
  const response = await fetch(url)
  if (response.status !== 200) throw new Error('Not Found')
  const data = await response.json()
  return parseFirestore(data).fields || {}
}
