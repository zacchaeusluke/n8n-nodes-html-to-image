# n8n-nodes-html-to-image

![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

This is an n8n community node. It lets you convert HTML code to images in your n8n workflows.

It uses [Puppeteer](https://www.npmjs.com/package/puppeteer) to take a screenshot of the HTML page. You can embed expressions and CSS into the HTML input.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

* [Installation](#installation)
* [Usage](#Usage)
* [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Features
* Enter custom HTML with the HTML editor
* Include expressions and CSS
* Set the width & height of the image
* Choose between png and jpeg output
* Transparent background option or set a custom background color

## Usage Notes

> JPEGs can't have a transparent background, so will always have a white background if 'Transparent' is selected.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)



