'use strict'

import Nightmare = require('nightmare')
import * as _ from 'lodash'
import * as rp from 'request-promise'
import Debug = require('debug')
const debug = Debug('yun:night')

export type Quality = 320000 | 192000 | 128000

/**
 * getData
 */

export default async function getData(ids: string[], quality: Quality = 320000): Promise<any> {
  if (!ids || !ids.length) return

  // bl
  let bl = {
    br: quality,
    'csrf_token': '',
    ids: ids
  }
  const s = JSON.stringify(bl)

  // args
  const defaultArgs = [
    '010001', [
      '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17',
      'a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c938701',
      '14af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97dde',
      'f52741d546b8e289dc6935b3ece0462db0a22b8e7'
    ].join(''),
    '0CoJUm6Qyw8W8jud'
  ]
  const args = _.cloneDeep(defaultArgs)
  args.unshift(s)
  const night = new Nightmare()

  let body
  let err
  try {
    body = await night
      .goto('http://music.163.com')
      .evaluate((args) => {
        /* eslint-env browser */
        return window.asrsea.apply(window, args)
      }, args)
      .end()
  } catch (e) {
    err = e
    if (err) {
      throw err
    }
  }

  // encText -> params
  body.params = body.encText
  delete body.encText

  let json = await rp({
    method: 'POST',
    url: 'http://music.163.com/weapi/song/enhance/player/url?csrf_token=6817f1ae5c9664c9076e301c537afc29',
    form: body,
    simple: false
  })
  json = JSON.parse(json)

  debug('POST result: %j', json)
  return json.data
}