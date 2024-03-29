/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import siteConfig from '@generated/docusaurus.config';
import mediumZoom from 'medium-zoom';

const { themeConfig } = siteConfig;

export default (function () {
  if (typeof window === 'undefined') {
    return null;
  }

  // Backwards compatibility
  const { zoomSelector = '.markdown img' } = themeConfig;

  // Allow medium-zoom options: https://www.npmjs.com/package/medium-zoom#options
  const { imageZoom: { selector = zoomSelector, options = {} } = {} } =
    themeConfig;
  const zoom = mediumZoom(options);

  function bindMediumZoom() {
    const images = document.querySelectorAll(selector);

    for (const image of images) {
      if (image._has_zoom_bound_) {
        continue;
      }

      image._has_zoom_bound_ = true;
      zoom.attach(image);
    }
  }

  return {
    onRouteUpdate({}) {
      setTimeout(bindMediumZoom, 1000);
    }
  };
})();
