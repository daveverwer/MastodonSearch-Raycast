import { useState } from 'react'
import { List, ActionPanel, Action, Image } from '@raycast/api'
import { MastodonSearch, SearchKind } from './search'

export default function Command() {
    const [searchText, setSearchText] = useState('')
    const { isLoading, searchResult } = MastodonSearch.search(searchText, SearchKind.Accounts)

    return (
        <List
            isLoading={isLoading}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            throttle
            searchBarPlaceholder='Search people'>
            {searchResult.accounts.map((item) => (
                <List.Item
                    key={item.id}
                    icon={{ source: item.avatar, mask: Image.Mask.RoundedRectangle }}
                    title={item.displayName}
                    subtitle={item.handle}
                    accessories={item.accessories}
                    actions={
                        <ActionPanel>
                            <Action.OpenInBrowser title='Visit Profile' url={item.url} />
                            <Action.CopyToClipboard
                                title='Copy Profile URL'
                                content={item.url}
                                shortcut={{ modifiers: ['cmd', 'shift'], key: 'c' }}
                            />
                            <Action.CopyToClipboard
                                title='Copy Handle'
                                content={item.handle}
                                shortcut={{ modifiers: ['cmd', 'shift', 'opt'], key: 'c' }}
                            />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    )
}
