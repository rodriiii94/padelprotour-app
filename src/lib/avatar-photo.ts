import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

const OUTPUT_SIZE = 512;

/**
 * Deja elegir una foto de la galería, la recorta al centro en cuadrado y la reduce a 512 px
 * antes de subirla (más rápido y sin mandar los megas de la foto original).
 * Devuelve la URI de la imagen lista, o null si la persona cancela.
 */
export async function pickAvatarPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    // En web no hay recorte propio: lo hace el paso siguiente al centro.
    allowsEditing: Platform.OS !== 'web',
    aspect: [1, 1],
    quality: 1,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const { uri, width, height } = result.assets[0];
  const side = Math.min(width, height);

  const rendered = await ImageManipulator.manipulate(uri)
    .crop({
      originX: Math.floor((width - side) / 2),
      originY: Math.floor((height - side) / 2),
      width: side,
      height: side,
    })
    .resize({ width: OUTPUT_SIZE })
    .renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });

  return saved.uri;
}
