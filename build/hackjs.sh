#!/bin/bash
_DIR_="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
set -xe

NODE_MODULES="${_DIR_}/../node_modules"

cp -f "${_DIR_}/hackjs/plugin-image-zoom.js" \
    "${NODE_MODULES}/plugin-image-zoom/src/zoom.js"

# 升级 PlantUML 的版本
## https://github.com/vowstar/node-plantuml-back
## https://plantuml.com/download
## https://plantuml.com/vizjs
PLANTUML_JAR_URL='https://github.com/plantuml/plantuml/releases/download/v1.2023.13/plantuml-1.2023.13.jar'
VIZJS_JAR_URL='http://beta.plantuml.net/j2v8_linux_x86_64-3.1.6.jar'
PLANTUML_JAR="$(basename "${PLANTUML_JAR_URL}")"
VIZJS_JAR="$(basename "${VIZJS_JAR_URL}")"
mkdir -p "${NODE_MODULES}/node-plantuml/vendor"
pushd "${NODE_MODULES}/node-plantuml/vendor"
    rm -f plantuml.jar vizjs.jar

    if [ ! -f "${PLANTUML_JAR}" ]; then
        curl --location --retry 10 "${PLANTUML_JAR_URL}" -o "${PLANTUML_JAR}"
    fi
    if [ ! -f "${VIZJS_JAR}" ]; then
        curl --location --retry 10 "${VIZJS_JAR_URL}" -o "${VIZJS_JAR}"
    fi

    ln -sf "${PLANTUML_JAR}" plantuml.jar
    ln -sf "${VIZJS_JAR}" vizjs.jar
popd

# 在 Netlify 中构建时，需本地安装 Noto 字体
## https://fontsource.org/fonts/noto-sans-sc
## https://manpages.ubuntu.com/manpages/focal/en/man5/fonts-conf.5.html
FONT_URL='https://r2.fontsource.org/fonts/noto-sans-sc@latest/download.zip'
if [ "$HOME" = "/opt/buildhome" ]; then
    # 在 Netlify 上，只有安装的 NPM 包才会缓存，
    # 故而，只能将字体放在某个 NPM 包中以确保其能够被缓存
    mkdir -p "${NODE_MODULES}/node-plantuml/fonts"
    rm -f "$HOME/.fonts"
    ln -sf "${NODE_MODULES}/node-plantuml/fonts" "$HOME/.fonts"
    cp "${_DIR_}/fonts/fonts.conf" "$HOME/.fonts.conf"

    pushd "$HOME/.fonts"
        if [ ! -f "noto-sans-sc.zip" ]; then
            curl --location --retry 10 "${FONT_URL}" -o "noto-sans-sc.zip"
            unzip noto-sans-sc.zip
        fi
    popd
fi
