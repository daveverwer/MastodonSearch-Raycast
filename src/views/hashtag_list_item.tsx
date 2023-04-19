import { List, ActionPanel, Action, Icon } from '@raycast/api'
import { MastodonHashtag } from '../models/mastodon_hashtag'

export function HashtagListItem(props: { hashtag: MastodonHashtag }) {
    return (
        <List.Item
            key={props.hashtag.name}
            icon={Icon.Hashtag}
            title={props.hashtag.name}
            actions={
                <ActionPanel>
                    <Action.OpenInBrowser title='Visit Hashtag' url={props.hashtag.url} />
                </ActionPanel>
            }
        />
    )
}
