import { useEffect, useState, useMemo } from 'react'
import { ActionPanel, Action, Icon, List, Image, getPreferenceValues } from '@raycast/api'
import { useFetch } from '@raycast/utils'
import { access } from 'fs'

// TODO:
// - [ ] Display a view that says to enter more than four characters.
// - [ ] Display a view that says no results were found.
// - [ ] Display a view that says there was an error.
// - [ ] Display the user avatar.
// - [ ] When calculating the handle, webfinger any usernames on the home server.

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
        console.log(this.acct)
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

export default function Command() {
    const [searchText, setSearchText] = useState('')
    const hasSearchText = useMemo(() => searchText.length > 4, [searchText])

    const prefs = getPreferenceValues()
    const { isLoading, data } = useFetch<MastodonSearchAPIResponse>(
        `https://${prefs.instance}/api/v2/search?type=accounts&q=${searchText}`,
        {
            // Make sure the screen isn't flickering when the searchText changes.
            keepPreviousData: true,
            execute: hasSearchText,
        }
    )

    const results = useMemo(() => new MastodonSearch(data), [data])

    return (
        <List isLoading={isLoading} searchText={searchText} onSearchTextChange={setSearchText} throttle>
            {results.accounts.map((item) => (
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
