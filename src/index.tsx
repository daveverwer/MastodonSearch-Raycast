import { useEffect, useState, useMemo } from 'react'
import { ActionPanel, Action, Icon, List, Image, Toast, getPreferenceValues, showToast } from '@raycast/api'
import { useFetch } from '@raycast/utils'

interface MastodonSearchAPIResponse {
    accounts: MastodonSearchAPIAccount[]
}

interface MastodonSearchAPIAccount {
    id: number
    display_name: string
    acct: string
    avatar: string
    url: string
    followers_count: number
    bot: boolean
}

class MastodonSearch {
    readonly accounts: MastodonAccount[]

    constructor(response?: MastodonSearchAPIResponse) {
        this.accounts = response?.accounts.map((account) => new MastodonAccount(account)) || []
    }

    accountListItems(): List.Item[] {
        return this.accounts.map((item) => (
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
        ))
    }
}

class MastodonAccount {
    readonly id: number
    readonly displayName: string
    readonly acct: string
    readonly avatar: string
    readonly url: string
    readonly followersCount: number
    readonly isBot: boolean

    constructor(account: MastodonSearchAPIAccount) {
        this.id = account.id
        this.displayName = account.display_name
        this.acct = account.acct
        this.avatar = account.avatar
        this.url = account.url
        this.followersCount = account.followers_count
        this.isBot = account.bot
    }

    get handle() {
        if (this.acct.includes('@')) {
            return `@${this.acct}`
        } else {
            const prefs = getPreferenceValues()
            return `@${this.acct}@${prefs.instance}`
        }
    }

    get accessories(): List.Item.Accessory[] {
        const accessories: List.Item.Accessory[] = []
        if (this.isBot) {
            accessories.push({ icon: Icon.ComputerChip, tooltip: 'Account is a bot', text: 'Bot Account' })
        }
        accessories.push({ icon: Icon.TwoPeople, tooltip: 'Number of followers', text: this.followersCount.toString() })
        return accessories
    }
}

function searchTooShortListItem(): List.Item[] {
    return [
        <List.Item key='too_short' icon={Icon.Warning} title='Enter at least five characters to search Mastodon.' />,
    ]
}

export default function Command() {
    const [searchText, setSearchText] = useState('')
    const validSearchText = useMemo(() => searchText.length > 4, [searchText])

    const prefs = getPreferenceValues()
    const { isLoading, data } = useFetch<MastodonSearchAPIResponse>(
        `https://${prefs.instance}/api/v2/search?type=accounts&q=${searchText}`,
        {
            // Make sure the screen isn't flickering when the searchText changes.
            keepPreviousData: true,
            execute: validSearchText,
            onError: (error) => {
                showToast(Toast.Style.Failure, 'Error', error.message)
                console.error(error)
            },
        }
    )
    const results = useMemo(() => new MastodonSearch(data), [data])

    return (
        <List isLoading={isLoading} searchText={searchText} onSearchTextChange={setSearchText} throttle>
            {validSearchText ? results.accountListItems() : searchTooShortListItem()}
        </List>
    )
}
