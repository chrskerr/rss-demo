//

import { OPENAI_KEY } from "astro:env/server";
import * as cheerio from "cheerio";
import OpenAI from "openai";
import { z } from "zod";

export async function loadHtml(url: string) {
  try {
    return await cheerio.fromURL(url);
  } catch {
    return undefined;
  }
}

export function tryDiscoverFeeds(
  $: cheerio.CheerioAPI,
  url: string
): { href: string; name: string }[] {
  const nodes = $(
    'link[rel="alternate"][type="application/rss+xml"], ' +
      'link[rel="alternate"][type="application/atom+xml"]'
  );

  const feeds: { href: string; name: string }[] = [];
  nodes.each((_i, node) => {
    const hrefAttr = $(node).attr("href");
    const name = $(node).attr("title");
    if (hrefAttr && name) {
      const href = new URL(hrefAttr, new URL(url).origin);
      feeds.push({ href: href.href, name });
    }
  });

  return feeds;
}

export async function tryFindFeedInHtml(
  $: cheerio.CheerioAPI,
  url: string
): Promise<{ href: string; name: string; content: string }[]> {
  const html = $.html();
  const origin = new URL(url).origin;

  const res = await queryChatGpt(html);

  const message = res.choices[0]?.message;
  if (message?.content == null || message?.refusal) {
    return [];
  }

  try {
    const feedData = feedResponseParser.parse(JSON.parse(message.content));
    if (feedData.feed.length === 0) {
      return [];
    }

    return [
      {
        href: url,
        name: $("title").text() ?? origin,
        content: JSON.stringify(
          feedData.feed.map<z.infer<typeof feedParser>[0]>((item) => ({
            ...item,
            url: new URL(item.url, url).href,
          }))
        ),
      },
    ];
  } catch (e) {
    console.log(e);
    console.log(message.content);
    return [];
  }
}

async function queryChatGpt(html: string) {
  const openai = new OpenAI({ apiKey: OPENAI_KEY });

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `This below html is from a page which may contain a listing of blog posts. If this page contains blog posts, I would you to return the title, url, and published data in a JSON format.\n\n${html}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "blog_response",
        strict: true,
        schema: {
          type: "object",
          properties: {
            feed: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                  },
                  url: {
                    type: "string",
                  },
                  published_at: {
                    type: "string",
                  },
                },
                required: ["title", "url", "published_at"],
                additionalProperties: false,
              },
            },
          },
          required: ["feed"],
          additionalProperties: false,
        },
      },
    },
  });

  return res;
}

export const feedParser = z.array(
  z.object({
    title: z.string(),
    url: z.string(),
    published_at: z.string(),
  })
);

const feedResponseParser = z.object({ feed: feedParser });
