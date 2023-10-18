import puppeteer from "puppeteer";
import selectors from "./selectors";
import { writeFile } from "fs/promises";
import { readFileSync } from "fs";
const brave =
  "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";

const coursesData = JSON.parse(
  readFileSync("./course.json", {
    encoding: "utf-8",
  })
);

const courses = readFileSync("./courses.txt", { encoding: "utf-8" }).split(
  /\r\n/
);

async function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time * 1000));
}

async function udemy(course: string) {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    executablePath: brave,
    headless: false,
  });

  const udemyCourse = await browser.newPage();
  const pages = await browser.pages();
  if (pages.length > 1) await pages[0].close();

  await udemyCourse.goto(course);

  await delay(7);

  const headlineTitleElement = await udemyCourse.waitForSelector(
    selectors.headlineTitle
  );

  const headlineTitle = await headlineTitleElement?.evaluate(
    (ele: any) => ele.innerText
  );

  const headlineDescriptionElement = await udemyCourse.waitForSelector(
    selectors.headlineDescription
  );

  const headlineDescription = await headlineDescriptionElement?.evaluate(
    (ele: any) => ele.innerText
  );

  const detailsElement = await udemyCourse.waitForSelector(
    selectors.stats
  );

  const details = (
    await detailsElement?.evaluate((ele: any) => ele.innerText)
  ).split("• ");

  (await coursesData).push({
    name: headlineTitle,
    sections: parseInt(details[0].split(" ")[0]),
    lectures: parseInt(details[1].split(" ")[0]),
    length: details[2].substring(0, 7).trim(),
    description: headlineDescription,
  });

  await writeFile("./course.json", JSON.stringify(await coursesData));

  await browser.close();
}

(async function () {
  for (let course of courses) {
    await udemy(course);
  }
})();
