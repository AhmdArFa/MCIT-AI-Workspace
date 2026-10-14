'use client';

import { McitDetailProvider } from './McitDetailProvider';
import SkillDetailInner from './SkillDetailInner';

export interface McitSkillDetailContentProps {
  identifier: string;
}

export const McitSkillDetailContent = ({ identifier }: McitSkillDetailContentProps) => {
  return (
    <McitDetailProvider identifier={identifier}>
      <SkillDetailInner type="mcit" />
    </McitDetailProvider>
  );
};
