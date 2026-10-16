#!/usr/bin/env node
// Deploy command for non-production branches in Workers Builds:
// the staging branch deploys the staging Worker; any other branch uploads a preview version.
import { execFileSync } from 'node:child_process';

const branch = process.env.WORKERS_CI_BRANCH;
const args = branch === 'staging' ? ['deploy', '--env', 'staging'] : ['versions', 'upload'];
console.log(`branch ${branch ?? '(unknown)'}: wrangler ${args.join(' ')}`);
execFileSync('npx', ['wrangler', ...args], { stdio: 'inherit' });
