import { i18n, arg } from '@site/src/components/I18n';

export default i18n()
  //
  .trans(['文章作者'])
  .en('Author')
  //
  .trans(['文章链接'])
  .en('URL')
  //
  .trans(['版权声明'])
  .en('Copyright')
  //
  .trans(['原文链接'])
  .en('Source URL')
  //
  .trans(['原文作者'])
  .en('Source Author')
  //
  .trans(['转载编者'])
  .en('Transfered By')
  //
  .trans(['译文作者'])
  .en('Translated By')
  //
  .trans(['转载请注明来自'])
  .en('Please indicate that it comes from')
  //
  .trans(['本译文采用许可协议'])
  .en('This translation is licensed under')
  //
  .trans(['署名-非商业性使用-相同方式共享 4.0 国际 (CC BY-NC-SA 4.0)'])
  .en(
    'Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)'
  )
  //
  .trans(['https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh'])
  .en('https://creativecommons.org/licenses/by-nc-sa/4.0/')
  //
  .trans(['本文章采用许可协议'])
  .en('This post is licensed under a ')
  //
  .trans(['《署名 4.0 国际 (CC BY 4.0)》'])
  .en('Attribution 4.0 International (CC BY 4.0) license')
  //
  .trans(['https://creativecommons.org/licenses/by/4.0/deed.zh'])
  .en('https://creativecommons.org/licenses/by/4.0/')
  //
  .trans(['，转载或商用请注明文章来源及作者信息。'])
  .en(', repost or commercial please indicate the source of the post and author information.')
  //
  .trans(['本译文采用与原文相同的许可协议进行授权和传播。'])
  .en(
    'This translation is authorized and disseminated under the same license agreement' +
      ' as the original text.'
  )
  .trans([
    '本译文不会对原文做任何除格式调整和拼写错误以外的调整和修改，以确保原文内容的完整性，保证原文所要阐述的事实和思想不被曲解。'
  ])
  .en(
    'This translation will not make any adjustments or modifications to the original text' +
      ' except for format adjustments and spelling errors,' +
      ' so as to ensure the integrity of the original text' +
      ' and ensure that the facts and ideas described in the original text' +
      ' will not be misinterpreted.'
  )
  //
  .trans([
    '本转载文章的权益归原文作者所有，再次转载请注明原文来源及原文作者，并声明原文版权！'
  ])
  .en(
    'The rights and interests of the transfered article belong to the author of the original text.' +
      ' Please indicate the source and author of the original text if you transfer it again,' +
      ' and declare the copyright of the original text!'
  )
  //
  .trans(['（原文未声明许可协议，原文最终解释权归原作者所有）'])
  .en(
    ' (The original text does not declare the license agreement,' +
      ' and the final interpretation of the original text belongs to the original author)'
  )
  //
  .trans(['。'])
  .en('.')
  //
  .trans(['！'])
  .en('!')
  //
  .done();
