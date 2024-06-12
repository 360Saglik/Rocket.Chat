import { PaletteStyleTag } from '@rocket.chat/fuselage';
import { useThemeMode } from '@rocket.chat/ui-theming/src/hooks/useThemeMode';
import React from 'react';

import { codeBlock } from '../lib/codeBlockStyles';

export const MainLayoutStyleTags = () => {
	const [, , theme] = useThemeMode();

	return (
		<>
			<PaletteStyleTag theme={theme} selector='.rcx-content--main, .rcx-tile' tagId={`main-palette-${theme}`} />
			<PaletteStyleTag theme='dark' selector='.rcx-sidebar--main' tagId='sidebar-palette' />
			{theme === 'dark' && <PaletteStyleTag selector='.rcx-content--main' palette={codeBlock} tagId='codeBlock-palette' />}
		</>
	);
};
