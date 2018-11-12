import Nightmare from 'nightmare'
import _ from 'lodash'
import RequestPromise from 'request-promise'
import Debug from 'debug'
import {CHROME_UA} from '../../hack/index'

const rp = RequestPromise.defaults({ jar: true })
const debug = Debug('yun:api:playurl:nightmare')

/**
 * getData
 */

export default async function(ids: number[], quality: number = 320000) {
  if (!ids || !ids.length) return
  quality = quality // 320 | 192 | 128

  // bl
  const bl = {
    br: quality,
    csrf_token: '',
    ids: JSON.stringify(ids),
  }
  const blStr = JSON.stringify(bl)

  // args
  const defaultArgs = [
    '010001',
    [
      '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17',
      'a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c938701',
      '14af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97dde',
      'f52741d546b8e289dc6935b3ece0462db0a22b8e7',
    ].join(''),
    '0CoJUm6Qyw8W8jud',
  ]
  const args = _.cloneDeep(defaultArgs)
  args.unshift(blStr)
  const night = new Nightmare()

  let body
  let err
  let cookies
  try {
    await night.goto('http://music.163.com')
    body = await night.evaluate(args => {
      /* eslint-env browser */
      return window.asrsea.apply(window, args)
    }, args)
    cookies = await night.cookies.get()
    await night.end()
  } catch (e) {
    err = e
    if (err) {
      throw err
    }
  }

  // encText -> params
  body.params = body.encText
  delete body.encText
  const Cookie = cookies.map(c => `${c.name}=${c.value}`).join('; ')

  let json = await rp({
    method: 'POST',
    url: 'https://music.163.com/weapi/song/enhance/player/url',
    form: body,
    simple: false,
    headers: {
      'User-Agent': CHROME_UA,
      Cookie,
    },
  })
  json = JSON.parse(json)

  debug('POST result: %j', json)
  return json.data
}
