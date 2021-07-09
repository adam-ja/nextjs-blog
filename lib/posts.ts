import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import remark from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

type PostMetadata = {
    date: string
    title: string
};

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);

    // Returns an array that looks like this:
    // [
    //   {
    //     params: {
    //       id: 'ssg-ssr'
    //     }
    //   },
    //   {
    //     params: {
    //       id: 'pre-rendering'
    //     }
    //   }
    // ]
    return fileNames.map(fileName => {
        return {
            params: {
                id: fileName.replace(/\.md$/, '')
            }
        }
    });
};

export function parsePostFile(id: string) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    return matter(fileContents);
}

export async function getPostData(id: string) {
    const matterResult = parsePostFile(id);
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);

    // Combine the data with the id
    return {
        id,
        contentHtml: processedContent.toString(),
        ...(matterResult.data as PostMetadata)
    };
}

export function getSortedPostsData() {
    // Get file names under /posts
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map(fileName => {
        // Remove ".md" from file name to get id
        const id = fileName.replace(/\.md$/, '')

        // Combine the data with the id
        return {
            id,
            ...(parsePostFile(id).data as PostMetadata)
        };
    });
    // Sort posts by date
    return allPostsData.sort(({ date: a }, { date: b }): number => {
        if (a < b) {
            return 1
        } else if (a > b) {
            return -1
        } else {
            return 0
        }
    });
};
