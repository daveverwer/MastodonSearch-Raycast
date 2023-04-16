import { useMemo } from 'react'
import { Icon, List, Toast, showToast, getPreferenceValues } from '@raycast/api'
import { useFetch } from '@raycast/utils'

export interface MastodonSearchAPIResponse {
    accounts: MastodonSearchAPIAccount[]
    hashtags: MastodonSearchAPIHashtag[]
}

export interface MastodonSearchAPIAccount {
    id: number
    display_name: string
    acct: string
    avatar: string
    url: string
    followers_count: number
    bot: boolean
}

export interface MastodonSearchAPIHashtag {
    name: string
    url: string
}

export enum SearchKind {
    Accounts = 'accounts',
    Hashtags = 'hashtags',
}

export class MastodonSearch {
    readonly accounts: MastodonAccount[]
    readonly hashtags: MastodonHashtag[]

    constructor(response?: MastodonSearchAPIResponse) {
        this.accounts = response?.accounts.map((account) => new MastodonAccount(account)) || []
        this.hashtags = response?.hashtags.map((hashtag) => new MastodonHashtag(hashtag)) || []
    }

    static search(query: string, kind: SearchKind) {
        const prefs = getPreferenceValues()
        const { isLoading, data } = useFetch<MastodonSearchAPIResponse>(
            `https://${prefs.instance}/api/v2/search?type=${kind}&q=${query}`,
            {
                // Make sure the screen isn't flickering when the searchText changes.
                keepPreviousData: true,
                // Blank queries return 400 Bad Request so we need a reactive monitor on query length.
                execute: useMemo(() => query.length > 0, [query]),
                // Show all errors with a Raycast toast.
                onError: (error) => {
                    showToast(Toast.Style.Failure, 'Error', error.message)
                    console.error(error)
                },
            }
        )

        const searchResult = useMemo(() => new MastodonSearch(data), [data])
        return { isLoading, searchResult }
    }
}

export class MastodonAccount {
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

export class MastodonHashtag {
    readonly name: string
    readonly url: string

    constructor(hashtag: MastodonHashtag) {
        this.name = hashtag.name
        this.url = hashtag.url
    }
}
