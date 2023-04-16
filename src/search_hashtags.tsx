import { useState } from 'react'
import { List, ActionPanel, Action, Icon } from '@raycast/api'
import { MastodonSearch, SearchKind } from './common'

export default function Command() {
    const [searchText, setSearchText] = useState('')
    const { isLoading, searchResult } = MastodonSearch.search(searchText, SearchKind.Hashtags)

    return (
        <List
            isLoading={isLoading}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            throttle
            searchBarPlaceholder='Search hashtags'>
            {searchResult.hashtags.map((item) => (
                <List.Item
                    key={item.name}
                    icon={Icon.Hashtag}
                    title={item.name}
                    actions={
                        <ActionPanel>
                            <Action.OpenInBrowser title='Visit Hashtag' url={item.url} />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    )
}
