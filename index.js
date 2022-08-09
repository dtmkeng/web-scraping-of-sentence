const puppeteer = require('puppeteer');
const fs = require('fs');
let readmed = `
# Web Scraping of Sentence
## source onlymyenglish https://onlymyenglish.com/

### List

`;
(async () => {
  let pageList = [];
  let page_number = 1;
  while(true) {
    const url = `https://onlymyenglish.com/category/examples-sentences/page/${page_number}`;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const res = await page.goto(url);
    console.log(`fech page url: ${url}`, res.status());
    if (res.status() !== 200) { break; }
    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("div.post-thumbnail > a"),
        heading => heading.href.trim());
    });
    pageList.push(headings)
    await browser.close();
    page_number++;
  }

  const listOfSentenceUrl = pageList.flat();
  console.log('start get content...');

  for(const url of listOfSentenceUrl) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const res = await page.goto(url);
    console.log(`fech page url: ${url}`, res.status());
    if (res.status() !== 200) { continue; }
    const listSentence = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("ol > li"),
        heading => heading.textContent.trim());
    });
    try {
      const filename = url.split('/')[url.split('/').length - 2]
      const filelLink = `https://github.com/dtmkeng/web-scraping-of-sentence/results/${filename}.json`
      readmed += `- [${filename}](${filelLink})\n\r`;
      fs.writeFileSync(`./results/${filename}.json`, JSON.stringify(listSentence))
    } catch (err) {
      console.error(err)
    }
    await browser.close();
  }

  try {
    fs.writeFileSync(`./README.md`, readmed)
  } catch (err) {
    console.error(err)
  }
  console.log('done!');
  process.exit(0);
})();
