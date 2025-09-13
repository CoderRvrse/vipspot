#!/usr/bin/env node
/**
 * PR Analysis Script for VIPSpot Release Bot
 * 
 * Analyzes PR commits and generates detailed release impact comments
 * for GitHub pull requests using shared release patterns.
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory paths
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

// Import shared patterns
const patternsPath = join(__dirname, 'release-patterns.mjs');
const { getReleaseType, generateVersionTag, hasCodePenMention, RELEASE_TYPES } = await import(`file://${patternsPath}`);

/**
 * Analyze commits in a PR
 */
export function analyzePRCommits(baseRef, headRef) {
  try {
    // Get commit messages from git log
    const gitCommand = `git log --oneline --pretty=format:"%h|%s" ${baseRef}..${headRef}`;
    const output = execSync(gitCommand, { encoding: 'utf-8', cwd: rootDir });
    
    if (!output.trim()) {
      return {
        commits: [],
        releaseCommits: [],
        nonReleaseCommits: [],
        codepenCommits: [],
        majorCommits: [],
        summary: {
          releaseCount: 0,
          nonReleaseCount: 0,
          codepenCount: 0,
          majorCount: 0,
          hasReleaseImpact: false,
          hasMajorImpact: false
        }
      };
    }
    
    const commits = output.trim().split('\n').map(line => {
      const [hash, ...messageParts] = line.split('|');
      const message = messageParts.join('|');
      
      // Analyze using shared patterns
      const releaseType = getReleaseType(message);
      const versionTag = generateVersionTag(releaseType);
      const triggersRelease = RELEASE_TYPES.includes(releaseType) || releaseType === 'major';
      const hasCodePen = hasCodePenMention(message);
      
      return {
        hash: hash.trim(),
        message: message.trim(),
        releaseType,
        versionTag,
        triggersRelease,
        hasCodePen,
        isMajor: releaseType === 'major'
      };
    });
    
    // Categorize commits
    const releaseCommits = commits.filter(c => c.triggersRelease);
    const nonReleaseCommits = commits.filter(c => !c.triggersRelease);
    const codepenCommits = commits.filter(c => c.hasCodePen);
    const majorCommits = commits.filter(c => c.isMajor);
    
    const summary = {
      releaseCount: releaseCommits.length,
      nonReleaseCount: nonReleaseCommits.length,
      codepenCount: codepenCommits.length,
      majorCount: majorCommits.length,
      hasReleaseImpact: releaseCommits.length > 0,
      hasMajorImpact: majorCommits.length > 0
    };
    
    return {
      commits,
      releaseCommits,
      nonReleaseCommits,
      codepenCommits,
      majorCommits,
      summary
    };
    
  } catch (error) {
    console.error('❌ Error analyzing PR commits:', error.message);
    throw error;
  }
}

/**
 * Generate emoji for commit type
 */
function getCommitIcon(releaseType, isMajor) {
  if (isMajor) return '💥';
  
  switch (releaseType) {
    case 'feat': return '✨';
    case 'fix': return '🐛';
    case 'docs': return '📝';
    case 'chore': return '🧹';
    case 'refactor': return '♻️';
    case 'perf': return '⚡';
    case 'test': return '🧪';
    case 'ci': return '🔧';
    case 'build': return '📦';
    default: return '🚀';
  }
}

/**
 * Generate PR comment markdown
 */
export function generatePRComment(analysis, prNumber, branchName) {
  const { summary, releaseCommits, codepenCommits } = analysis;
  
  let comment = `## 🤖 Release Impact Analysis

**PR:** #${prNumber} • **Branch:** \`${branchName}\`

### 📊 Summary
`;

  // Impact assessment
  if (summary.hasReleaseImpact) {
    if (summary.hasMajorImpact) {
      comment += `🎯 **Impact:** 💥 **MAJOR RELEASE** will be triggered

`;
    } else {
      comment += `🎯 **Impact:** 🚀 **Release will be triggered**

`;
    }
  } else {
    comment += `🎯 **Impact:** 📝 **No release** (development/maintenance commits)

`;
  }
  
  // Summary table
  comment += `| Metric | Count | Status |
|--------|-------|---------|
| 🚀 Release Commits | ${summary.releaseCount} | ${summary.releaseCount > 0 ? '✅ Will trigger release' : '⭐ No release'} |
| 📝 Dev Commits | ${summary.nonReleaseCount} | 📋 Development only |
| 💥 Breaking Changes | ${summary.majorCount} | ${summary.majorCount > 0 ? '⚠️ Major version bump' : '✅ No breaking changes'} |
| 🎨 CodePen Updates | ${summary.codepenCount} | ${summary.codepenCount > 0 ? '🎨 Showcase sections added' : '📝 No CodePen changes'} |

`;

  // Release commits breakdown
  if (summary.hasReleaseImpact) {
    comment += `### 🚀 Release-Triggering Commits

`;
    
    releaseCommits.forEach(commit => {
      const icon = getCommitIcon(commit.releaseType, commit.isMajor);
      const codepenIcon = commit.hasCodePen ? ' 🎨' : '';
      
      comment += `- ${icon} **\`${commit.hash}\`** \`${commit.message}\`${codepenIcon}
  → **Type:** ${commit.releaseType} → **Version:** \`${commit.versionTag}\`

`;
    });
  }
  
  // CodePen section
  if (summary.codepenCount > 0) {
    comment += `### 🎨 CodePen Updates Detected

This PR includes CodePen-related changes! Release notes will include:
- **🎨 CodePen Showcase Section** in CHANGELOG.md
- **Featured Demo Links:** [Rocket Back-to-Top](https://codepen.io/CoderRvrse/pen/QwjXGom), [3D Card](https://codepen.io/CoderRvrse/pen/VYvNzzN), [Matrix Rain](https://codepen.io/CoderRvrse/pen/azvxEZG)
- **Profile Link:** [Browse All Demos](https://codepen.io/CoderRvrse)

`;
  }
  
  // Next steps section
  comment += `### ⚙️ What Happens Next?

`;
  
  if (summary.hasReleaseImpact) {
    comment += `1. **✅ PR Merge** → Triggers release workflow
`;
    
    if (summary.hasMajorImpact) {
      comment += `2. **💥 Major Release** → \`v2025.MM.DD\` (no suffix for breaking changes)
`;
    } else {
      comment += `2. **🚀 Automated Release** → \`vYYYY.MM.DD-type\` based on commit types
`;
    }
    
    comment += `3. **📋 CHANGELOG Update** → Automatic changelog generation
`;
    
    if (summary.codepenCount > 0) {
      comment += `4. **🎨 CodePen Showcase** → Added to release notes and changelog
`;
    }
    
    comment += `5. **🌐 Live Deployment** → Changes go live on [vipspot.net](https://vipspot.net)
`;
  } else {
    comment += `1. **✅ PR Merge** → No release triggered (development commits only)
2. **📝 Changes Applied** → Code improvements without version bump
`;
  }
  
  // Footer
  comment += `
---
<sub>🤖 Auto-generated by [VIPSpot Release Bot](https://github.com/CoderRvrse/vipspot/blob/main/.github/workflows/pr-release-analysis.yml) • [Patterns](https://github.com/CoderRvrse/vipspot/blob/main/.github/scripts/release-patterns.mjs)</sub>`;

  return comment;
}

/**
 * CLI interface for testing
 */
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node pr-analysis.mjs <base-ref> <head-ref> [pr-number] [branch-name]');
    console.log('');
    console.log('Examples:');
    console.log('  node pr-analysis.mjs origin/main HEAD');
    console.log('  node pr-analysis.mjs main feature/new-component 123 feature/new-component');
    console.log('');
    console.log('For testing locally:');
    console.log('  node pr-analysis.mjs HEAD~3 HEAD');
    process.exit(1);
  }
  
  const [baseRef, headRef, prNumber = '0', branchName = 'test-branch'] = args;
  
  try {
    console.log(`🔍 Analyzing commits between ${baseRef}...${headRef}`);
    console.log('');
    
    const analysis = analyzePRCommits(baseRef, headRef);
    
    console.log('📊 **Analysis Results:**');
    console.log(`- Total commits: ${analysis.commits.length}`);
    console.log(`- Release commits: ${analysis.summary.releaseCount}`);
    console.log(`- Dev commits: ${analysis.summary.nonReleaseCount}`);
    console.log(`- CodePen mentions: ${analysis.summary.codepenCount}`);
    console.log(`- Major changes: ${analysis.summary.majorCount}`);
    console.log('');
    
    // Generate and display comment
    const comment = generatePRComment(analysis, prNumber, branchName);
    console.log('📝 **Generated PR Comment:**');
    console.log('```markdown');
    console.log(comment);
    console.log('```');
    
    // Save to file for testing
    writeFileSync('pr-comment-preview.md', comment);
    console.log('');
    console.log('💾 Comment saved to pr-comment-preview.md');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}