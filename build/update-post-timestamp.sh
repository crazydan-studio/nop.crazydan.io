#!/bin/bash
set -ex

post_dir=blog

# https://github.com/theme-next/hexo-theme-next/issues/893#issuecomment-498080459
# %ai: 2018-02-25 16:53:50 +0800
# %ad: Wed Oct 2 00:00:43 2019 +0800
# %ct: 1570612408
git ls-files -z "$post_dir" \
    | while read -d '' path; do \
        touch \
          -m -t \
          "$(git log -1 --format="%cd" --date=iso -- "$path" | sed -r 's/(-|:| )//g; s/\+.*//g; s/([0-9]{2})$/.\1/g')" \
          "$path"; \
      done
