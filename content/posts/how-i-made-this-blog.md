---
title: "How I Made This Blog"
date: 2020-01-29T11:05:56-06:00
author: Nathan Getty
tags: ["blog", "meta"]
draft: true
---

# Whats the deal with blogs and shit?

The main reason I wanted this blog is that running a normal website requires hosting a server, keeping it online, updating it and all the other jazz that I dont really care to manage

# So how is this blog made?

1. We use hugo to build the source and write all the articles in markdown format, which makes things so damn easy
2. The source code is stored on github, and we leverage github actions to automatically post new changes to AWS
3. We leverage AWS S3 and a CloudFront Distribution to handle the CDN and certificates


# How do you get the automatic deployment working

Well github actions are pretty sweet and it allows us to run builds directly from github, which is a great feature. Heres the example of our yml file
```yaml
  
name: Build and Deploy

on: push

jobs:
  build:
    name: Build and Deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - name: Install Hugo
        run: |
          HUGO_DOWNLOAD=hugo_extended_${HUGO_VERSION}_Linux-64bit.tar.gz
          wget https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${HUGO_DOWNLOAD}
          tar xvzf ${HUGO_DOWNLOAD} hugo
          mv hugo $HOME/hugo
        env:
          HUGO_VERSION: 0.59.1
      - name: Hugo Build
        run: $HOME/hugo -v
        
      - name: Deploy to S3
        if: github.ref == 'refs/heads/master'
        run: $HOME/hugo -v deploy --maxDeletes -1
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.HUGO_S3_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.HUGO_S3_SECRET }}
```
