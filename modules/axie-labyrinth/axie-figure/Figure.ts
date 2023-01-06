import "pixi-spine"

import { Mixer } from "./types"

export class Figure extends PIXI.spine.Spine {
  static readonly resourcePath =
    "https://axiecdn.axieinfinity.com/mixer-stuffs/v2/"
  mixer: Mixer

  constructor(mixer: Mixer, atlasKeyMap: Map<string, string>, loader: PIXI.loaders.Loader) {
  const allTextures: { [key: string]: PIXI.Texture } = {}

  atlasKeyMap.forEach((atlasName, atlasKey) => {
    allTextures[atlasName] = loader.resources[atlasKey].texture;
  })

  const spineAtlas = new PIXI.spine.core.TextureAtlas()
  spineAtlas.addTextureHash(allTextures, false)

  const spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(
    spineAtlas
  )

  const spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader)
  const spineData = spineJsonParser.readSkeletonData(mixer.spine)
  super(spineData)

  this.mixer = mixer
  this.scale.set(0.18)
  }
}

