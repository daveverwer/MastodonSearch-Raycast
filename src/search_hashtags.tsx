import { useState } from 'react'
import { List, ActionPanel, Action, Image, Icon } from '@raycast/api'
import { MastodonSearch, SearchKind, displayNameFor } from './search'

function SearchKindDropdown(props: { onChange: (newValue: SearchKind) => void }) {
    return (
        <List.Dropdown
            tooltip='Search for&hellip;'
            storeValue={true}
            onChange={(newValue) => {
                props.onChange(newValue as SearchKind)
            }}>
            {Object.values(SearchKind).map((searchKind) => (
                <List.Dropdown.Item key={searchKind} title={displayNameFor(searchKind)} value={searchKind} />
            ))}
        </List.Dropdown>
    )
}

export default function Command() {
    const [searchText, setSearchText] = useState('')
    const [searchKind, setSearchKind] = useState(SearchKind.Accounts)

    const { isLoading, searchResult } = MastodonSearch.search(searchText, searchKind)

    return (
        <List
            isLoading={isLoading}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            throttle
            searchBarAccessory={<SearchKindDropdown onChange={setSearchKind} />}
            searchBarPlaceholder='Search Mastodon'>
            <List.Section title='People'>
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
            </List.Section>
            <List.Section title='Hashtags'>
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
            </List.Section>
        </List>
    )
}
