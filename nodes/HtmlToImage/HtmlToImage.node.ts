import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import puppeteer, { ScreenshotOptions } from 'puppeteer';

export class HtmlToImage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'HTML to Image',
		name: 'htmlToImage',
		group: ['transform'],
		version: 1,
		description: 'Create an image from HTML using Puppeteer',
		defaults: {
			name: 'HTML to Image',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			// Node properties which are displayed to the user and
			// the user can change on the node.
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'PNG',
						value: 'png',
					},
					{
						name: 'JPEG',
						value: 'jpeg',
					},
				],
				default: 'png',
				placeholder: 'Choose format',
				description: 'Image format to convert HTML to',
			},
			{
				displayName: 'HTML',
				name: 'html',
				type: 'string',
				typeOptions: {
					editor: 'htmlEditor',
				},
				default: '',
				placeholder: '<p>This is my HTML</p>',
				description: 'The HTML and CSS to convert to an image',
				required: true,
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 800,
				description: 'Width of the output image in pixels',
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 600,
				description: 'Height of the output image in pixels',
			},
			{
				displayName: 'Background',
				name: 'background',
				type: 'options',
				options: [
					{ name: 'Transparent', value: 'transparent', },
					{ name: 'White', value: '#FFFFFF' },
					{ name: 'Custom Color', value: 'custom' },
				],
				default: 'transparent',
				description: 'Background color of the image (note: transparent will not work with JPEG format)',
			},
			{
				displayName: 'Custom Background Color',
				name: 'customBackgroundColor',
				type: 'color',
				default: '#FFFFFF',
				placeholder: '#FF0000',
				description: 'Custom background color in hex format (e.g., #FF0000 for red)',
				displayOptions: {
					show: {
						background: ['custom'],
					},
				},
			},
			{
				displayName: 'File Name',
				name: 'fileName',
				type: 'string',
				default: '',
				placeholder: 'image.png',
				description: 'Optional file name for the output image (extension will be added automatically if omitted)',
						},
		],
	};

	// The function below is responsible for actually converting HTML to an image.
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Get the HTML and CSS from the node parameters
		const htmlInput = this.getNodeParameter('html', 0, '') as string;
		const outputFormat = this.getNodeParameter('outputFormat', 0, 'png') as string;

		// Get image dimensions
		const width = this.getNodeParameter('width', 0, 800) as number;
		const height = this.getNodeParameter('height', 0, 600) as number;

		// Determine background settings
		const background = this.getNodeParameter('background', 0, 'transparent') as string;
		let backgroundColor = background;
		let omitBackground = background === 'transparent';

		// If custom background is selected, get the custom color
		if (background === 'custom') {
			backgroundColor = this.getNodeParameter('customBackgroundColor', 0, '#FFFFFF') as string;
		}

		// Determine background color if needed
		let backgroundCss = '';
		if (background !== 'transparent') {
			backgroundCss = `body { background: ${backgroundColor}; }\n`;
		}

		// Inject CSS into HTML
		let htmlWithCss = htmlInput;
		if (backgroundCss && backgroundCss.trim() !== '') {
			// If <head> exists, inject <style> inside it; otherwise, add <head> and <style>
			if (/<head>/i.test(htmlInput)) {
				htmlWithCss = htmlInput.replace(/<head>/i, `<head><style>${backgroundCss}</style>`);
			} else {
				htmlWithCss = `<head><style>${backgroundCss}</style></head>${htmlInput}`;
			}
		}

		// Launch Puppeteer and render HTML to image
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.setViewport({
			width: width,
			height: height,
		});
		await page.setContent(htmlWithCss, { waitUntil: 'networkidle0' });

		// Prepare screenshot options
		const screenshotOptions: ScreenshotOptions = {
			encoding: 'binary',
			omitBackground,
		};
		if (outputFormat === 'jpeg') {
			screenshotOptions.type = 'jpeg';
		}

		// Take screenshot
		const screenshotBuffer = (await page.screenshot(screenshotOptions)) as Buffer;
		await browser.close();

		// Determine file name
		const userFileName = this.getNodeParameter('fileName', 0, '') as string;
		let fileName = userFileName?.trim() || `image.${outputFormat}`;
		if (!fileName.toLowerCase().endsWith(`.${outputFormat}`)) {
			fileName = fileName.replace(/\.[^/.]+$/, '');
			fileName += `.${outputFormat}`;
		}

		return [
			[
				{
					json: {
						mimeType: `image/${outputFormat}`,
						fileName,
						width,
						height,
					},
					binary: {
						data: await this.helpers.prepareBinaryData(
							screenshotBuffer,
							fileName,
							`image/${outputFormat}`,
						),
					},
				},
			],
		];
	}
}
