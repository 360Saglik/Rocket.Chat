import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/rocketchat:tap-i18n';
import { FlowRouter } from 'meteor/kadira:flow-router';
import toastr from 'toastr';


import { settings } from '../../settings/client';
import { RoomHistoryManager, MessageAction } from '../../ui-utils/client';
import { messageArgs } from '../../ui-utils/client/lib/messageArgs';
import { Rooms } from '../../models/client';
import { roomTypes } from '../../utils/client';
import { handleError } from '../../../client/lib/utils/handleError';

Meteor.startup(function() {
	MessageAction.addButton({
		id: 'star-message',
		icon: 'star',
		label: 'Star',
		context: ['starred', 'message', 'message-mobile', 'threads'],
		action(_, props) {
			const { message = messageArgs(this).msg } = props;
			Meteor.call('starMessage', { ...message, starred: true }, function(error: any) {
				if (error) {
					return handleError(error);
				}
			});
		},
		condition({ message, subscription, user, room }) {
			if (subscription == null && settings.get('Message_AllowStarring')) {
				return false;
			}
			const isLivechatRoom = roomTypes.isLivechatRoom(room.t);
			if (isLivechatRoom) {
				return false;
			}

			return !message.starred || !message.starred.find((star: any) => star._id === user._id);
		},
		order: 9,
		group: 'menu',
	});

	MessageAction.addButton({
		id: 'unstar-message',
		icon: 'star',
		label: 'Unstar_Message',
		context: ['starred', 'message', 'message-mobile', 'threads'],
		action(_, props) {
			const { message = messageArgs(this).msg } = props;

			Meteor.call('starMessage', { ...message, starred: false }, function(error?: any) {
				if (error) {
					handleError(error);
				}
			});
		},
		condition({ message, subscription, user }) {
			if (subscription == null && settings.get('Message_AllowStarring')) {
				return false;
			}

			return Boolean(message.starred && message.starred.find((star: any) => star._id === user._id));
		},
		order: 9,
		group: 'menu',
	});

	MessageAction.addButton({
		id: 'jump-to-star-message',
		icon: 'jump',
		label: 'Jump_to_message',
		context: ['starred', 'threads', 'message-mobile'],
		action(_, props) {
			const { message = messageArgs(this).msg } = props;
			if (window.matchMedia('(max-width: 500px)').matches) {
				(Template.instance() as any).tabBar.close();
			}
			if (message.tmid) {
				return FlowRouter.go(FlowRouter.getRouteName(), {
					tab: 'thread',
					context: message.tmid,
					rid: message.rid,
					jump: message._id,
					name: Rooms.findOne({ _id: message.rid }).name,
				}, {
					jump: message._id,
				});
			}
			RoomHistoryManager.getSurroundingMessages(message, 50);
		},
		condition({ message, subscription, user }) {
			if (subscription == null || !settings.get('Message_AllowStarring')) {
				return false;
			}

			return Boolean(message.starred && message.starred.find((star) => star._id === user._id));
		},
		order: 100,
		group: ['message', 'menu'],
	});

	MessageAction.addButton({
		id: 'permalink-star',
		icon: 'permalink',
		label: 'Get_link',
		// classes: 'clipboard',
		context: ['starred', 'threads'],
		async action(_, props) {
			const { message = messageArgs(this).msg } = props;
			const permalink = await MessageAction.getPermaLink(message._id);
			navigator.clipboard.writeText(permalink);
			toastr.success(TAPi18n.__('Copied'));
		},
		condition({ message, subscription, user }) {
			if (subscription == null) {
				return false;
			}

			return Boolean(message.starred && message.starred.find((star) => star._id === user._id));
		},
		order: 101,
		group: 'menu',
	});
});
