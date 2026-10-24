import { VideoItem, Rule, Lesson, ExampleItem } from '../types';

/**
 * Generate a beautifully structured Markdown note for external note-taking tools
 * (Obsidian, Notion, Logseq, Bear, Roam, Apple Notes, etc.)
 */
export function generateVideoMarkdown(
  video: VideoItem,
  options: {
    includeRules?: boolean;
    includeLessons?: boolean;
    includeExamples?: boolean;
    includeMetadata?: boolean;
  } = {}
): string {
  const {
    includeRules = true,
    includeLessons = true,
    includeExamples = true,
    includeMetadata = true
  } = options;

  const nowStr = new Date().toISOString().split('T')[0];
  const tagsList = (video.tags || []).map(t => `#${t.replace(/\s+/g, '_')}`).join(' ');

  let md = '';

  // YAML Frontmatter for Obsidian / Notion / Logseq
  if (includeMetadata) {
    md += `---
title: "${video.title.replace(/"/g, '\\"')}"
source: "${video.source_type}"
url: "${video.source_url}"
author: "${video.channel_or_author || 'Unknown'}"
duration: "${video.duration_label}"
created_at: "${video.created_at || nowStr}"
exported_from: "My Knowledge AI"
tags: [${(video.tags || []).map(t => `"${t}"`).join(', ')}]
---

`;
  }

  // Document Heading
  md += `# ${video.title}\n\n`;

  // Metadata block
  md += `> **Source**: [${video.source_type.toUpperCase()}](${video.source_url})  \n`;
  md += `> **Author/Channel**: ${video.channel_or_author || 'N/A'}  \n`;
  md += `> **Duration**: ${video.duration_label}  \n`;
  if (tagsList) {
    md += `> **Tags**: ${tagsList}  \n`;
  }
  md += `\n---\n\n`;

  // Executive Summary
  md += `## 📌 Executive Summary\n\n`;
  md += `${video.summary}\n\n`;

  // Extracted Rules Section
  if (includeRules && video.rules && video.rules.length > 0) {
    md += `## 🛡️ Distilled Rules & Directives (${video.rules.length})\n\n`;
    video.rules.forEach((rule: Rule, index: number) => {
      const severityIcon = 
        rule.severity === 'essential' ? '🔴 **[ESSENTIAL]**' :
        rule.severity === 'avoid' ? '⚠️ **[AVOID]**' : '🟢 **[RECOMMENDED]**';

      md += `### ${index + 1}. ${rule.rule_statement}\n\n`;
      md += `- **Severity**: ${severityIcon}\n`;
      md += `- **Timestamp**: \`${rule.timestamp_label}\` (${rule.timestamp_seconds}s)\n`;
      if (rule.category) {
        md += `- **Category**: \`${rule.category}\`\n`;
      }
      md += `- **Rationale / Why**: ${rule.rationale}\n\n`;
    });
    md += `---\n\n`;
  }

  // Chapterized Lessons Section
  if (includeLessons && video.lessons && video.lessons.length > 0) {
    md += `## 📚 Chapterized Lessons (${video.lessons.length})\n\n`;
    video.lessons.forEach((lesson: Lesson, index: number) => {
      md += `### Lesson ${index + 1}: ${lesson.title}\n\n`;
      md += `**Timeline**: \`${lesson.timestamp_label}\`  \n`;
      if (lesson.category) {
        md += `**Category**: \`${lesson.category}\`  \n\n`;
      }
      md += `${lesson.summary}\n\n`;

      if (lesson.key_takeaways && lesson.key_takeaways.length > 0) {
        md += `**Key Takeaways:**\n`;
        lesson.key_takeaways.forEach(takeaway => {
          md += `- [x] ${takeaway}\n`;
        });
        md += `\n`;
      }
    });
    md += `---\n\n`;
  }

  // Concrete Examples & Code
  if (includeExamples && video.examples && video.examples.length > 0) {
    md += `## 💻 Concrete Examples & Demonstrations (${video.examples.length})\n\n`;
    video.examples.forEach((example: ExampleItem, index: number) => {
      md += `### Example ${index + 1}: ${example.context}\n\n`;
      md += `**Timestamp**: \`${example.timestamp_label}\`\n\n`;
      md += `\`\`\`typescript\n${example.code_or_demonstration}\n\`\`\`\n\n`;
    });
    md += `---\n\n`;
  }

  // Note footer
  md += `*Exported from My Knowledge AI on ${nowStr} with verified timestamp grounding.*  \n`;

  return md;
}

/**
 * Generate a Master Knowledge Digest covering multiple videos
 */
export function generateLibraryMarkdown(videos: VideoItem[]): string {
  const nowStr = new Date().toISOString().split('T')[0];
  let md = `# 📖 My Knowledge AI - Master Video Library Digest\n\n`;
  md += `> Generated on ${nowStr} across ${videos.length} analyzed videos.\n\n`;
  md += `---\n\n`;

  videos.forEach(v => {
    md += generateVideoMarkdown(v, { includeMetadata: false });
    md += `\n\n=========================================\n\n`;
  });

  return md;
}

/**
 * Trigger a native file download in browser / Android tablet
 */
export function downloadMarkdownFile(filename: string, content: string): void {
  // Sanitize filename
  const safeName = filename
    .replace(/[^a-zA-Z0-9_\-\. ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const finalFilename = safeName.endsWith('.md') ? safeName : `${safeName}.md`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', finalFilename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Copy text with clipboard API fallback
 */
export async function copyMarkdownToClipboard(content: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = content;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy markdown:', err);
    return false;
  }
}
