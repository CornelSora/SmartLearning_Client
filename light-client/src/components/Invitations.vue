<template>
    <div>
        <label><b>Invitations</b></label>
        <div>
            <b-table bordered hover :items="invitations" :fields="fields">
                <template slot="Problem" slot-scope="data">
                    <!-- `data.value` is the value after formatted by the Formatter -->
                    <router-link tag="li" :to="data.value" @click="setCurrentSolution(data.item.solution)" v-if="data.item.Status =='Acccepted' && fromProfile">
                        <a> {{ data.item.ProblemName }}</a>
                    </router-link>
                    <b-button size="sm" 
                        @click="setCurrentSolution(data.item.Solution, data.value)"
                        v-if="data.item.Status =='Acccepted' && !fromProfile">                        
                        {{ data.item.ProblemName }}
                    </b-button>
                    <router-link tag="li" :to="data.item.ProblemNotAccepted" v-if="data.item.Status != 'Acccepted'">
                        <a>{{ data.item.ProblemName }}</a>
                    </router-link>
                </template>
                <template slot="actions" slot-scope="row" v-if="displayActions">
                    <b-button 
                        size="sm"
                        @click.stop="accept(row.item, row.index, $event.target)"
                        class="mr-1"
                        variant="success"
                        v-if="row.item.Status !='Acccepted'">
                        accept
                    </b-button>
                    <b-button
                        size="sm"
                        @click.stop="decline(row.item, row.index, $event.target)"
                        class="mr-1"
                        variant="danger"
                        v-else>
                        decline
                    </b-button>
                </template>
            </b-table>
        </div>
        <b-alert
            :show="error != ''"
            variant="danger">
            {{ error }}
        </b-alert>
        <b-alert
            :show="info != ''"
            variant="info">
            {{ info }}
        </b-alert>
    </div>
</template>

<script>
import InvitationStorage from '../services/InvitationStorage'

export default {
    data () {
        return {
            invitations: [],
            problems: [],
            originalInvitations: [],
            fields: [
                { key: "Date", label: "Date", sortable: true },
                { key: "Problem", label: "Problem", sortable: true },
                { key: "Status", label: "Status", sortable: true },
                { key: "InvitedByEmail", label: "Invited by", sortable: true },
                { key: "actions" }
            ],
            info: '',
            error: '',
            invStorage: new InvitationStorage()
        }
    },
    async mounted () {
        console.log("Is from profilE?")
        console.warn(this.fromProfile)
        let loader = this.$loading.show()
        try {
            await this.getProblems()
            await this.getInvitations(this.email)
            console.warn(this.invitations)
        } catch (e) {
            console.warn(e)
        } finally {
            loader.hide()
        }
        var subscription = this.$subject.subscribe({
            next: async (sender) => {
                if (sender.type == 'refreshInvitations') {
                    let loader = this.$loading.show()
                    try {
                        await this.getInvitations(sender.email)
                    } finally {
                        loader.hide()
                    }
                }
            }
        })
    },
    methods: {
        async getInvitations (email) {
            this.invitations = []
            try {
                var result = await this.$api.account.getInvitations(email)
                if (result.ok) {
                    let invits = result.result.invitations
                    if (!result.result) return
                    this.originalInvitations = result.result.invitations
                    for (var i = 0; i < invits.length; i++) {
                        if (this.invitedBy && this.invitedBy != invits[i].invitedBy) {
                            continue
                        }
                        var invitation = {}
                        invitation.Date = invits[i].date
                        invitation.ProblemName = this.problems.find(y => y.UID == invits[i].problem).name
                        invitation.Problem = `/problem/${invits[i].problem}?invitedBy=${invits[i].invitedBy}&hash=${invits[i].emailHash}`
                        invitation.ProblemNotAccepted = `/problem/${invits[i].problem}` 
                        invitation.ProblemId = invits[i].problem
                        invitation.InvitedBy = invits[i].invitedBy
                        invitation.InvitedByEmail = invits[i].invitedByEmail
                        invitation.Status = invits[i].isAccepted ? 'Acccepted' : 'Not accepted'
                        invitation.Solution = invits[i].solution
                        invitation._cellVariants = { Status: invits[i].isAccepted ? 'success' : 'danger' }
                        this.invitations.push(invitation)
                    }
                }
            } catch (e) {
                throw e
            }
        },
        async getProblems () {
            let loader = this.$loading.show()
            try {
                const result = await this.$api.problem.getAllProblems()
                if (result.ok) {
                this.problems = result.result.problems
                } else {
                console.warn('something went wrong when I got the problems')
                }
            } catch (e) {
                console.warn(e)
            } finally {
                loader.hide()
            }
        },
        async accept (item, index, target) {
            await this.updateInvitations(item, true)
            item.Status = 'Acccepted'
            item._cellVariants = { Status: 'success' }
        },
        async decline (item, index, target) {
            await this.updateInvitations(item, false)
            item.Status = 'Not accepted'
            item._cellVariants = { Status: 'danger' }
        },
        async updateInvitations(item, accept = false) {
            for (var i = 0; i < this.originalInvitations.length; i++) {
                if (this.originalInvitations[i].invitedBy == item.InvitedBy && this.originalInvitations[i].problem == item.ProblemId) {
                    this.originalInvitations[i].isAccepted = accept
                }
            }
            var request = {
                invitations: this.originalInvitations,
                email: this.email
            }
            let loader = this.$loading.show()
            try {
                await this.$api.account.updateInvitation(request)
                //  await this.getInvitations()
            } catch (e) {
                console.warn(e)
            } finally {
                loader.hide()
            }
        },
        setCurrentSolution (solution, url) {
            debugger
            this.invStorage.setCode(solution)
            this.$router.push(url)
        }
    },
    props: {
        email: {
            type: String,
            required: false
        },
        displayActions: {
            type: Boolean,
            required: false,
            default: true
        },
        invitedBy: {
            type: String,
            required: false
        },
        fromProfile: {
            type: Boolean,
            required: false,
            default: false
        }
    }
}
</script>

<style>

</style>
