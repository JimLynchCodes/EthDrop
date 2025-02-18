import React, { useState } from 'react'
import getWeb3 from './getWeb3'

import potOfGoldEmptyImg from './assets/pot-of-gold-empty.png'
import potOfGoldFullImg from './assets/pot-of-gold-full.png'

import EthDropCore from './contracts/EthDropCore.json'
import { useParams, withRouter } from 'react-router-dom'

import { FillButton } from 'tailwind-react-ui'
import { shortenedAddress } from './shortened-address'

const util = require('util');

function GroupEventPage(props) {

  /**
   *  State Variables
   */

  const [accounts, setAccounts] = useState([])
  const [ethDropCoreInstance, setEthDropCoreInstance] = useState(null)
  const [web3, setWeb3] = useState(null)
  const [isCOO, setIsCOO] = useState(null)
  const [isAdmin, setIsAdmin] = useState(null)
  const [isContributor, setIsContributor] = useState(null)
  const [isPendingNewJoiner, setIsPendingNewJoiner] = useState(null)
  const [adminAddressesForGroup, setAdminAddressesForGroup] = useState([])
  const [adminsEnabledForGroup, setAdminsEnabledForGroup] = useState([])
  const [adminNamesForGroup, setAdminNamesForGroup] = useState([])
  const [isEligibleRecipient, setIsEligibleRecipient] = useState('')
  const [groupEventData, setGroupEventData] = useState('')

  const [newJoinerAddresses, setNewJoinerAddresses] = useState([])
  const [newJoinerNames, setNewJoinerNames] = useState([])
  const [newJoinerApprovals, setNewJoinerApprovals] = useState([])

  const [newAdminAddressInputValue, setNewAdminAddressInputValue] = useState('')
  const [newAdminNameInputValue, setNewAdminNameInputValue] = useState('')

  const [newJoinerInputValue, setNewJoinerInputValue] = useState('')

  const [eligibleRecipients, setEligibleRecipients] = useState('')
  const [eligibleRecipientNames, setEligibleRecipientNames] = useState('')
  const [registeredRecipients, setRegisteredRecipients] = useState('')
  const [eligibleRecipientsHasCollectedWinnings, setEligibleRecipientsHasCollectedWinnings] = useState('')
  const [
    newEligibleRecipientAddressInputValue,
    setEligibleRecipientAddressInputValue,
  ] = useState('')
  const [
    newEligibleRecipientNameInputValue,
    setEligibleRecipientNameInputValue,
  ] = useState('')
  const [
    eligibleRecipientsEligibilityEnabled,
    setEligibleRecipientsEligibilityEnabled,
  ] = useState('')
  const [isRegisteredRecipient, setIsRegisteredRecipient] = useState('')
  const [
    contributionAmountInputValue,
    setContributionAmountInputValue,
  ] = useState('')
  const [contributionAmount, setContributionAmount] = useState('')
  const [newSponsorInputValue, setNewSponsorInputValue] = useState('')
  const [
    updateSponsorNameInputValue,
    setUpdateSponsorNameInputValue,
  ] = useState('')
  const [updateSponsorImgInputValue, setUpdateSponsorImgInputValue] = useState(
    '',
  )
  const [
    updateSponsorLinkToInputValue,
    setUpdateSponsorLinkToInputValue,
  ] = useState('')
  const [currentSponsorAddress, setCurrentSponsorAddress] = useState('')
  const [currentSponsorName, setCurrentSponsorName] = useState('')
  const [currentSponsorImgLinkTo, setCurrentSponsorImgLinkTo] = useState('')
  const [currentSponsorImg, setCurrentSponsorImg] = useState('')
  const [hasClaimableWinnings, setHasClaimableWinnings] = useState('')

  const groupName = useParams().groupName
  const groupId = useParams().groupId

  React.useEffect(() => {
    fetchData();
  }, [])


  async function fetchData() {
    try {
      console.log('fetch start')

      const web3 = await getWeb3()
      console.log('web3 ', web3)
      setWeb3(web3)

      const accounts = await util.promisify(web3.eth.getAccounts)()
      setAccounts(accounts);

      console.log('GOT ACCOUNTS ', accounts)

      const networkId = await web3.eth.net.getId()
      const deployedNetwork = EthDropCore.networks[networkId]

      const ethDropCoreInstance = new web3.eth.Contract(
        EthDropCore.abi,
        deployedNetwork && deployedNetwork.address,
      )

      setEthDropCoreInstance(ethDropCoreInstance)

      console.log('accounts: ', accounts)

      await checkAdminStuff(groupId, accounts[0], ethDropCoreInstance)

      const isCOO = await ethDropCoreInstance.methods
        .isCOO()
        .call({ from: accounts[0] })
      console.log('isCOO ', isCOO)
      setIsCOO(isCOO)

      await checkRegisteredRecipientsStuff(groupId, accounts, ethDropCoreInstance)

      await checkAmIPendingNewJoiner(groupId, accounts, ethDropCoreInstance);

      const isContributor = await ethDropCoreInstance.methods
        .amIContributor(groupId)
        .call({ from: accounts[0] })
      console.log('isContributor ', isContributor)
      setIsContributor(isContributor)

      const currentSponsorAddress = await ethDropCoreInstance.methods
        .getCurrentSponsorAddress(groupId)
        .call({ from: accounts[0] })
      console.log('currentSponsorAddress ', currentSponsorAddress)
      setCurrentSponsorAddress(currentSponsorAddress)

      const groupEventData = await ethDropCoreInstance.methods
        .getGroupEventData(groupId)
        .call({ from: accounts[0] })
      console.log('groupEventData ', groupEventData)
      setGroupEventData(groupEventData)
      setContributionAmount(groupEventData[2])

      await checkEligibleRecipients(groupId, accounts, ethDropCoreInstance)

      const sponsorInfo = await ethDropCoreInstance.methods
        .getContributorInfo(groupId)
        .call({ from: accounts[0] })
      console.log('sponsorInfo ', sponsorInfo)

      setCurrentSponsorName(sponsorInfo[0])
      setCurrentSponsorImg(sponsorInfo[1])
      setCurrentSponsorImgLinkTo(sponsorInfo[2])

      // ethDropCoreInstance.events.allEvents(async (err, eventObj) => {
      // console.log('group page heard event! ', eventObj.event)

      // console.log('got web3 accounts: ', accounts)
      // const networkId = await web3.eth.net.getId()
      // const deployedNetwork = EthDropCore.networks[networkId]

      // const ethDropCoreInstance = new web3.eth.Contract(
      //   EthDropCore.abi,
      //   deployedNetwork && deployedNetwork.address,
      // )

      // setEthDropCoreInstance(ethDropCoreInstance)

      // setAccounts(accounts)
      // console.log('checking admin with accounts ', accounts)

      // await checkAdminStuff(groupId, accounts[0], ethDropCoreInstance)

      // const isCOO = await ethDropCoreInstance.methods
      //   .isCOO()
      //   .call({ from: accounts[0] })
      // console.log('isCOO ', isCOO)
      // setIsCOO(isCOO)

      // await checkRegisteredRecipientsStuff(groupId, accounts, ethDropCoreInstance)

      // const isContributor = await ethDropCoreInstance.methods
      //   .amIContributor(groupId)
      //   .call({ from: accounts[0] })
      // console.log('isContributor ', isContributor)
      // setIsContributor(isContributor)

      // const currentSponsorAddress = await ethDropCoreInstance.methods
      //   .getCurrentSponsorAddress(groupId)
      //   .call({ from: accounts[0] })
      // console.log('currentSponsorAddress ', currentSponsorAddress)
      // setCurrentSponsorAddress(currentSponsorAddress)

      // const groupEventData = await ethDropCoreInstance.methods
      //   .getGroupEventData(groupId)
      //   .call({ from: accounts[0] })
      // console.log('groupEventData ', groupEventData)
      // setGroupEventData(groupEventData)
      // setContributionAmount(groupEventData[2])

      // await checkEligibleRecipients(groupId, accounts, ethDropCoreInstance)

      // await checkAmIPendingNewJoiner(groupId, accounts, ethDropCoreInstance);

      // const sponsorInfo = await ethDropCoreInstance.methods
      //   .getContributorInfo(groupId)
      //   .call({ from: accounts[0] })
      // console.log('sponsorInfo ', sponsorInfo)

      // setCurrentSponsorName(sponsorInfo[0])
      // setCurrentSponsorImg(sponsorInfo[1])
      // setCurrentSponsorImgLinkTo(sponsorInfo[2])

      ethDropCoreInstance.events.allEvents(async (err, eventObj) => {
        console.log('group page heard event! ', eventObj.event)
        console.log('event return values! ', eventObj.returnValues)

        // if (eventObj.returnValues.groupId) {
        switch (eventObj.event) {
          case 'CooUpdated':
            // await this.checkIfImCOO()
            break

          case 'AppPaused':
            // await this.checkIsPaused()
            break;

          case 'NewUserRequestedToJoinGroup':
            console.log('checking pending 1')
            await checkAmIPendingNewJoiner(groupId, accounts, ethDropCoreInstance)
            break;

          case 'EventStarted':
          case 'EventEnded':
          case 'RegistrationEnded':
            const groupEventData = await ethDropCoreInstance.methods
              .getGroupEventData(groupId)
              .call({ from: accounts[0] })
            console.log('groupEventData ', groupEventData)
            setGroupEventData(groupEventData)

            break

          case 'AdminAdded':

            console.log('an admin has been added! ', eventObj.returnValues)
            await checkAdminStuff(groupId, accounts[0], ethDropCoreInstance)
            break;

          case 'AdminReEnabled':
          case 'AdminRemoved':
            await checkAdminStuff(groupId, accounts[0], ethDropCoreInstance)
            break

          case 'ContributorAdded':
            const isContributor = await ethDropCoreInstance.methods
              .amIContributor(groupId)
              .call({ from: accounts[0] })
            console.log('isContributor ', isContributor)
            setIsContributor(isContributor)

            const currentSponsorAddress = await ethDropCoreInstance.methods
              .getCurrentSponsorAddress(groupId)
              .call({ from: accounts[0] })
            console.log('currentSponsorAddress ', currentSponsorAddress)
            setCurrentSponsorAddress(currentSponsorAddress)
            break;

          case 'ContributorInfoUpdated':
            console.log('heard ContributorInfoUpdated event')
            setCurrentSponsorName(eventObj.returnValues.sponsorName)
            setCurrentSponsorImg(eventObj.returnValues.imgUrl)
            setCurrentSponsorImgLinkTo(eventObj.returnValues.imgLinkToUrl)

            break;

          case 'ContributionMade':
            console.log(
              'setting contribution amount: ',
              eventObj.returnValues.amount,
            )
            setContributionAmount(eventObj.returnValues.amount)
            break;

          case 'EligibleRecipientAdded':
          case 'EligibleRecipientRemoved':

            await checkEligibleRecipients(groupId, accounts, ethDropCoreInstance);
            await refreshNewJoinerData(groupId, accounts[0], ethDropCoreInstance);

            break;

          case 'NewJoinerRequestApproved':

            await checkAmIPendingNewJoiner(groupId, accounts, ethDropCoreInstance);
            await checkEligibleRecipients(groupId, accounts, ethDropCoreInstance);

            break;

          case 'NewUserRequestedToJoinGroup':

            await refreshNewJoinerData(groupId, accounts[0], ethDropCoreInstance);
            break;

          case 'RecipientRegistered':
            await checkEligibleRecipients(groupId, accounts, ethDropCoreInstance);
            await checkRegisteredRecipientsStuff(groupId, accounts, ethDropCoreInstance);

            break;

          case 'WinningsClaimed':
            await checkRegisteredRecipientsStuff(groupId, accounts, ethDropCoreInstance)
            break;


          default:
            console.log(`UNHANDLED EVENT!! : ${eventObj.event}`)
        }
        // }
      })

      console.log('done fetching')
      // })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(`Failed to load web3, accounts, or contract.` + error)
      console.error(error)
    }
  }

  async function checkEligibleRecipients(groupId, accounts, ethDropCoreInstance) {

    console.log('checking elig: ', groupId, accounts, ethDropCoreInstance)

    const eligibleRecipientsEligibilityEnabled = await ethDropCoreInstance.methods
      .getEligibleRecipientIsEligibilityEnabled(groupId)
      .call({ from: accounts[0] })
    console.log(
      'eligibleRecipientsEligibilityEnabled ',
      eligibleRecipientsEligibilityEnabled,
    )

    console.log('checking is eligible for account: ', accounts[0])
    const isEligibleRecipient = (await ethDropCoreInstance.methods
      .amIEligibleRecipient(groupId)
      .call({ from: accounts[0] }))

    console.log('isEligibleRecipient ', isEligibleRecipient)

    const eligibleRecipientAddresses = (await ethDropCoreInstance.methods
      .getEligibleRecipientAddresses(groupId)
      .call({ from: accounts[0] }))

    console.log('eligibleRecipients ', eligibleRecipientAddresses)

    const eligibleRecipientNames = (await ethDropCoreInstance.methods
      .getEligibleRecipientNames(groupId)
      .call({ from: accounts[0] }))

    console.log('eligibleRecipientNames ', eligibleRecipientNames)

    const filteredArrays = {
      addresses: [],
      names: [],
      eligibilityEnabled: []
    };

    eligibleRecipientsEligibilityEnabled.forEach((isEnabled, index) => {

      if (isEnabled) {
        filteredArrays.addresses.push(eligibleRecipientAddresses[index]);
        filteredArrays.names.push(eligibleRecipientNames[index]);
        filteredArrays.eligibilityEnabled.push(isEnabled);
      }

    })

    setIsEligibleRecipient(isEligibleRecipient)
    setEligibleRecipients(filteredArrays.addresses)
    setEligibleRecipientNames(filteredArrays.names)
    setEligibleRecipientsEligibilityEnabled(filteredArrays.eligibilityEnabled)

  }

  async function checkRegisteredRecipientsStuff(groupId, accounts, ethDropCoreInstance) {
    const isRegisteredRecipient = await ethDropCoreInstance.methods
      .amIRegisteredRecipient(groupId)
      .call({ from: accounts[0] })
    console.log('isRegisteredRecipient ', isRegisteredRecipient)
    setIsRegisteredRecipient(isRegisteredRecipient)

    const hasClaimableWinnings = await ethDropCoreInstance.methods
      .doIHaveClaimableWinnings(groupId)
      .call({ from: accounts[0] })
    console.log('hasClaimableWinnings ', hasClaimableWinnings)
    setHasClaimableWinnings(hasClaimableWinnings)

    const registeredRecipients = await ethDropCoreInstance.methods
      .getRegisteredRecipientNames(groupId)
      .call({ from: accounts[0] })
    console.log('registeredRecipients ', registeredRecipients)
    setRegisteredRecipients(registeredRecipients.slice(1))

    const eligibleRecipientsHasCollectedWinnings = await ethDropCoreInstance.methods
      .getEligibleRecipientsHasCollectedWinnings(groupId)
      .call({ from: accounts[0] })
    console.log('eligibleRecipientsHasCollectedWinnings ', eligibleRecipientsHasCollectedWinnings)
    setEligibleRecipientsHasCollectedWinnings(eligibleRecipientsHasCollectedWinnings.slice(1))
  }

  async function checkAmIPendingNewJoiner(groupId, accounts, ethDropCoreInstance) {

    console.log('checking pending 2')
    const amIPendingNewJoiner = await ethDropCoreInstance.methods
      .amIPendingNewJoiner(groupId)
      .call({ from: accounts[0] })
    console.log('amIPendingNewJoiner ', amIPendingNewJoiner)
    console.log('checking pending 3', amIPendingNewJoiner)
    setIsPendingNewJoiner(amIPendingNewJoiner)
  }

  async function checkAdminStuff(groupId, account, ethDropCoreInstance) {
    try {

      console.log('checking if admin...')

      console.log('am I an admin of group: ', groupId, ' for admin: ', account)

      const nextAdminIndex = await ethDropCoreInstance.methods
        .getAddressNextAdminIndex(groupId)
        .call({ from: account })
      console.log('nextAdminIndex ', nextAdminIndex)

      const isAdmin = await ethDropCoreInstance.methods
        .amIAdmin(groupId)
        .call({ from: account })
      console.log('isAdmin ', isAdmin)
      setIsAdmin(isAdmin)

      const adminInfoForGroup = await ethDropCoreInstance.methods
        .getAdminsForGroup(groupId)
        .call({ from: account })
      console.log('adminsForGroup ', adminAddressesForGroup)

      setAdminAddressesForGroup(adminInfoForGroup[0])
      setAdminsEnabledForGroup(adminInfoForGroup[1])
      setAdminNamesForGroup(adminInfoForGroup[2])


      await refreshNewJoinerData(groupId, accounts[0], ethDropCoreInstance);

    } catch (err) {
      console.log('checking admins failed...', err)
    }
  }

  async function removeAdmin(groupId, account) {

    console.log('removing admin with address: ', account)
    try {
      const isAdmin = await ethDropCoreInstance.methods
        .removeAdmin(groupId, account)
        .send({ from: accounts[0] })

      console.log('admin removed!')

      setIsAdmin(isAdmin)
    } catch (error) {
      alert(`Failed to remove admin...` + error)
    }
  }

  async function refreshNewJoinerData(groupId, account, ethDropCoreInstance) {

    console.log('refreshing new joiners...', groupId, account, ethDropCoreInstance);

    const newJoinerRequests = await ethDropCoreInstance.methods
      .getNewJoinerRequests(groupId)
      .call({ from: account })
    console.log('newJoinerRequests ', newJoinerRequests);

    const requestApprovals = newJoinerRequests[2];

    const onlyUnapprovedRequestAddresses = [];
    const onlyUnapprovedRequestNames = [];
    const onlyUnapprovedApprovals = [];

    requestApprovals.forEach((requestApproval, i) => {
      if (!requestApproval) {
        onlyUnapprovedRequestAddresses.push(newJoinerRequests[0][i]);
        onlyUnapprovedRequestNames.push(newJoinerRequests[1][i]);
        onlyUnapprovedApprovals.push(false);
      }
    })

    setNewJoinerAddresses(onlyUnapprovedRequestAddresses.slice(1))
    setNewJoinerNames(onlyUnapprovedRequestNames.slice(1))
    setNewJoinerApprovals(onlyUnapprovedApprovals.slice(1))

  }

  async function reEnableAdmin(groupId, account) {

    console.log('reEnableing admin with address: ', account)
    try {
      await ethDropCoreInstance.methods
        .reEnableAdmin(groupId, account)
        .send({ from: accounts[0] })

      console.log('admin reenabled!')

    } catch (error) {
      alert(`Failed to reenable admin...` + error)
    }
  }

  async function startAirdropEvent(groupId) {
    try {
      await ethDropCoreInstance.methods
        .startEvent(groupId)
        .send({ from: accounts[0] })

      console.log('event started!')
    } catch (error) {
      alert(`Failed to start event...` + error)
    }
  }

  async function endRegistration(groupId) {
    try {
      await ethDropCoreInstance.methods
        .closeEventRegistration(groupId)
        .send({ from: accounts[0] })
      console.log('closed event registration!')
    } catch (error) {
      alert(`Failed to close event registration...` + error)
    }
  }

  async function endEvent(groupId) {
    try {
      await ethDropCoreInstance.methods
        .endEvent(groupId)
        .send({ from: accounts[0] })
      console.log('ended event!')
    } catch (error) {
      alert(`Failed to end event...` + error)
    }
  }

  async function registerForEvent(groupId) {
    try {
      await ethDropCoreInstance.methods
        .registerForEvent(groupId)
        .send({ from: accounts[0] })
      console.log('registered for event!')
    } catch (error) {
      alert(`Failed to register for event...` + error)
    }
  }

  async function claimWinnings(groupId) {
    try {
      await ethDropCoreInstance.methods
        .claimWinnings(groupId)
        .send({ from: accounts[0] })
      console.log('claimed winnings!')
    } catch (error) {
      alert(`Failed to claim winnings...` + error)
    }
  }

  async function newEligibleRecipientSubmit(event) {
    event.preventDefault()

    try {
      await ethDropCoreInstance.methods
        .addEligibleRecipient(
          newEligibleRecipientAddressInputValue,
          newEligibleRecipientNameInputValue,
          groupId,
        )
        .send({ from: accounts[0] })

      console.log('added eligible recipient! ')

      setEligibleRecipientAddressInputValue('')
      setEligibleRecipientNameInputValue('')
    } catch (err) {
      console.log('adding eligible recipient failed...', err)
    }
  }

  async function approveRequestToJoinGroupClicked(groupId, account) {
    try {
      await ethDropCoreInstance.methods
        .approveRequestToJoinGroup(
          groupId,
          account
        )
        .send({ from: accounts[0] })

      console.log('approved account!')

      setEligibleRecipientAddressInputValue('')
      setEligibleRecipientNameInputValue('')
    } catch (err) {
      console.log('adding eligible recipient failed...', err)
    }
  }

  async function newAdminSubmit(event) {
    event.preventDefault()

    const newAdminAddress = newAdminAddressInputValue.trim()
    const newAdminName = newAdminNameInputValue.trim()

    console.log('new admin: ', groupId, newAdminAddress, newAdminName, 'from ', accounts[0])

    try {
      const createdGroup = await ethDropCoreInstance.methods
        .addAdmin(groupId, newAdminAddress, newAdminName)
        .send({ from: accounts[0] })

      console.log(`added admin ${newAdminName} succeeded!`)

      setNewAdminAddressInputValue('')
      setNewAdminNameInputValue('')
    } catch (err) {
      console.log('adding admin failed...', err)
    }
  }

  async function submitRequestToJoinGroup(event) {
    event.preventDefault()

    const newJoinerName = newJoinerInputValue.trim()

    console.log('new joiner: ', groupId, newJoinerName, 'from ', accounts[0])

    try {
      const join = await ethDropCoreInstance.methods
        .requestToJoinGroup(groupId, newJoinerName)
        .send({ from: accounts[0] })

      console.log(`new joiner request ${newJoinerName} succeeded!`)

      setNewJoinerInputValue('')
    } catch (err) {
      console.log('new joiner request failed...', err)
    }
  }

  async function newSponsorSubmit(event) {
    event.preventDefault()

    try {
      await ethDropCoreInstance.methods
        .changeContributor(newSponsorInputValue, groupId)
        .send({ from: accounts[0] })

      console.log('contributior changed! ')

      setNewSponsorInputValue('')
    } catch (err) {
      console.log('changing contributor failed...', err)
    }
  }

  async function submitUpdateContributorInfo(event) {
    event.preventDefault()

    try {
      await ethDropCoreInstance.methods
        .updateContributorInfo(
          groupId,
          updateSponsorNameInputValue,
          updateSponsorImgInputValue,
          updateSponsorLinkToInputValue,
        )
        .send({ from: accounts[0] })

      console.log('contributor changed! ')

      setUpdateSponsorNameInputValue('')
      setUpdateSponsorImgInputValue('')
      setUpdateSponsorLinkToInputValue('')
    } catch (err) {
      console.log('changing contributor failed...', err)
    }
  }

  async function submitContribution(event) {
    event.preventDefault()

    try {
      const weiAmount = web3.utils.toWei(contributionAmountInputValue, 'ether')

      await ethDropCoreInstance.methods
        .contributeToPot(groupId)
        .send({ value: weiAmount, from: accounts[0] })

      console.log('contribution submitted! ')
      setContributionAmountInputValue('')
    } catch (err) {
      console.log('submitting contribution failed...', err)
    }
  }

  function requestToJoinNameHandleChange(event) {
    setNewJoinerInputValue(event.target.value)
  }

  function newAdminAddressHandleChange(event) {
    setNewAdminAddressInputValue(event.target.value)
  }

  function newAdminNameHandleChange(event) {
    setNewAdminNameInputValue(event.target.value)
  }
  function newEligibleRecipientAddressHandleChange(event) {
    setEligibleRecipientAddressInputValue(event.target.value)
  }

  function newEligibleRecipientNameHandleChange(event) {
    setEligibleRecipientNameInputValue(event.target.value)
  }

  function contributionAmountHandleChange(event) {
    setContributionAmountInputValue(event.target.value)
  }

  function newSponsorHandleChange(event) {
    setNewSponsorInputValue(event.target.value)
  }

  function updateSponsorNameHandleChange(event) {
    setUpdateSponsorNameInputValue(event.target.value)
  }

  function updateSponsorImgHandleChange(event) {
    setUpdateSponsorImgInputValue(event.target.value)
  }

  function updateSponsorLinkToHandleChange(event) {
    setUpdateSponsorLinkToInputValue(event.target.value)
  }

  if (!web3) {
    return <h1>Loading web3...Group event page! {groupName}</h1>
  }

  if (web3)
    return (
      <div className="App">
        <div className="mx-5 my-10">
          <h1 className="break-all">{groupName}</h1>
        </div>

        {groupEventData &&
          (groupEventData[0] === '0' || groupEventData[0] === '3') && (
            <div className="my-10">
              <h2>There is no event currently in progress!</h2>

              <br />
              <br />

              <h4>
                Check with the group admins for information on when the next
                airdrop event is happening!
              </h4>
            </div>
          )}
        {/* Today's Sponsor Header */}
        <div className="my-5 mx-4">
          <p>Event Sponsor:</p>

          {!currentSponsorName && <p>(Sponsor has not yet set their name)</p>}
          <p></p>
          <h1> {currentSponsorName}</h1>
        </div>
        {/* Sponsor Image */}
        <div className="my-5 mx-4">
          {currentSponsorName && (
            <a href={currentSponsorImgLinkTo}>
              <img src={currentSponsorImg} className="w-85 my-10 mx-auto" />
            </a>
          )}

          {!currentSponsorName && <p>(Sponsor has not yet set their image)</p>}
        </div>

        {/* The Pot Section */}
        {groupEventData && groupEventData[2] && (
          <div>
            <div className="mt-10 py-5">
              <h2 className="m-5">There has been</h2>
              <h1 className="my-10">
                {groupEventData &&
                  groupEventData[2] &&
                  web3.utils.fromWei(contributionAmount, 'ether') + ' Eth'}
              </h1>
              <h2 className="m-5">
                contributed to the pot{+contributionAmount > 0 ? '!' : '.'}
              </h2>
              {/* <h1></h1> */}

              {+contributionAmount === 0 && (
                <div className="mt-10">
                  <img
                    src={potOfGoldEmptyImg}
                    alt="pot of gold empty"
                    className="m-auto w-1/4"
                  ></img>
                </div>
              )}

              {+contributionAmount > 0 && (
                <div className="mt-10">
                  <img
                    src={potOfGoldFullImg}
                    alt="pot of gold full"
                    className="m-auto w-1/4"
                  ></img>
                </div>
              )}

              <hr className="m-2" />

              {registeredRecipients.length > 0 && (
                <div className="my-5">
                  <br />
                  <h3 className="my-5">There&nbsp;
                    {registeredRecipients.length === 1 &&
                      <span>is</span>
                    }
                    {registeredRecipients.length > 1 &&
                      <span>are</span>
                    }
                    &nbsp;currently</h3>
                  <h1 className="my-5">{registeredRecipients.length}</h1>
                  <h3 className="my-5">
                    user{registeredRecipients.length !== 1 ? 's' : ''}{' '}
                    registered for
                  </h3>
                  <h3 className="my-5">this airdrop!</h3>
                  <ul>
                    {registeredRecipients.map((recipientName, i) => {
                      return (
                        <li key={'recipName ' + i} className="m-5 my-10">
                          <h2>{'-  ' + recipientName}

                            {eligibleRecipientsHasCollectedWinnings[i] &&
                              <span>&nbsp;&nbsp;&nbsp;&nbsp;✅</span>}
                          </h2>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* // spacer */}
        <div className="my-10"></div>

        {isEligibleRecipient && (
          <div>
            {isRegisteredRecipient && (
              <div>
                <p>You are registered for this event!</p>
              </div>
            )}

            <div>
              {!isRegisteredRecipient && (
                <div>
                  <p>You are an eligible recipient for this event!</p>
                </div>
              )}

              {
                // only show when registration is open!
                groupEventData[0] === '1' && <div>
                  <p>Click the button to register!</p>
                  <button
                    onClick={() => registerForEvent(groupId)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                    disabled={isRegisteredRecipient === true}
                  >
                    Register!
                  </button>
                </div>
              }
            </div>
          </div>
        )}
        {!isEligibleRecipient && (
          <div>
            <p className="m-5">

              You are not an eligible recipient for this airdrop! Enter your name below and click the button to request to join this group!
            </p>
          </div>
        )}

        {
          // users CANNOT request to join during claim winnings phase 
          groupEventData[0] !== '3' &&
          <div>
            {!isEligibleRecipient && isPendingNewJoiner &&
              <div>
                <p>You have asked to join this group, but an admin has not yet approved it!</p>
              </div>}

            {!isEligibleRecipient && !isPendingNewJoiner &&
              <div>
                <div className="w-full max-w-m">
                  <form
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                    onSubmit={submitRequestToJoinGroup}
                  >
                    <div className="mb-6">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2 my-4"
                        htmlFor="request-to-join-input"
                      >
                        <div className="my-4">Your Name</div>
                      </label>

                      <input
                        className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="request-to-join-input"
                        type="text"
                        placeholder="Joe Shmoe"
                        value={newJoinerInputValue}
                        onChange={requestToJoinNameHandleChange}
                      />
                    </div>

                    <br />
                    <div className="flex items-center justify-center flex-col">
                      <button
                        onClick={submitRequestToJoinGroup}
                        type="submit"
                        value="Submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                      >
                        Request To Join Group
                      </button>

                      <br />
                      <br />

                      <div>

                        <p>
                          <i>
                            Note: An admin of this group will need to approve you before you can participate in this group's airdrops.
                          </i>
                        </p>
                      </div>
                      <br />
                    </div>
                  </form>
                </div>
              </div>}
          </div>
        }

        {/* Phase 0 - Has Not yet started (or 3- ended) */}
        {((groupEventData && groupEventData[0] === '0') ||
          groupEventData[0] === '3') && (
            <div>
              {isEligibleRecipient && (
                <div className="m-5">
                  <p>You are an eligible recipient for airdrops by this group!</p>
                </div>
              )}

              {isAdmin && (
                <div className="m-3 mb-10">
                  <p>
                    Since you are an admin, you can start the event by opening
                    registration!
                  </p>
                  <button
                    onClick={() => startAirdropEvent(groupId)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Open AirDrop Registration
                  </button>
                </div>
              )}

              {!isAdmin && (
                <div>
                  <p>Waiting for a group admin to open registration...</p>
                </div>
              )}
            </div>
          )}
        {/* Phase 1 - Registration */}
        {groupEventData && groupEventData[0] === '1' && (
          <div>
            {/* Phase 2 - Registration */}

            <div>
              <p>Registration for this airdrop event is still open!</p>
            </div>

            <br />

            {isAdmin && (
              <div className="m-5">
                <p>
                  Since you are an admin, you can move the event from
                  registration phase to claim winnings phase!
                </p>
                <button
                  onClick={() => endRegistration(groupId)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  End Registration Phase
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phase 2 - Claiming Winnings */}
        {groupEventData && groupEventData[0] === '2' && (
          <div>
            <h2 className="m-5">
              Each user can claim{' '}
              {web3.utils.fromWei(groupEventData[3], 'ether')} Eth!
            </h2>

            {isRegisteredRecipient && (
              <div>
                {hasClaimableWinnings && (
                  <p>Click the button below to claim your winnings!!</p>
                )}

                {!hasClaimableWinnings && (
                  <div>
                    <p>
                      You have already claimed your winnings for this event.
                    </p>
                    <p>Thanks for coming out!</p>
                  </div>
                )}

                <button
                  onClick={() => claimWinnings(groupId)}
                  disabled={!hasClaimableWinnings}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  Claim Winnings
                </button>
              </div>
            )}

            {isAdmin && (
              <div>
                <p>Since you are an admin, you can end the event!</p>
                <br />

                <button
                  onClick={() => endEvent(groupId)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  End Event
                </button>
              </div>
            )}
          </div>
        )}
        <hr className="m-5" />

        {/* Contributor Admin Panel */}
        {isContributor && (
          <div
            style={{
              margin: '2vw',
              padding: '20px',
              border: 'solid black 2px',
              borderRadius: '20px',
            }}
          >
            <h1>You are the sponsor for this event!</h1>

            <p>You can update your sponsor details here!</p>

            <div className="w-full max-w-m">
              <form
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={submitUpdateContributorInfo}
              >
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2 my-4"
                    htmlFor="sponsor-name-input"
                  >
                    <div className="my-4">Sponsor Name</div>
                  </label>

                  <input
                    className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="sponsor-name-input"
                    type="text"
                    placeholder="The Foobar Protocol"
                    value={updateSponsorNameInputValue}
                    onChange={updateSponsorNameHandleChange}
                  />
                  {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
                </div>

                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2 my-4"
                    htmlFor="sponsor-img-input"
                  >
                    <div className="my-4">Sponsor Image Url:</div>
                  </label>

                  <input
                    className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="sponsor-img-input"
                    type="text"
                    placeholder="https://www.your-awesome-website.io/your-cool-image.svg"
                    value={updateSponsorImgInputValue}
                    onChange={updateSponsorImgHandleChange}
                  />
                  {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
                </div>

                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2 my-4"
                    htmlFor="new-ceo"
                  >
                    <div className="my-4">Sponsor Link To Url:</div>
                  </label>

                  <input
                    className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="link-to-input"
                    type="text"
                    placeholder="https://www.your-awesome-website.io/special-promo-page"
                    value={updateSponsorLinkToInputValue}
                    onChange={updateSponsorLinkToHandleChange}
                  />
                  {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={submitUpdateContributorInfo}
                    type="submit"
                    value="Submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                  >
                    Update Sponsor Info
                  </button>
                </div>
              </form>
            </div>

            {/*  Only when not currently in progress */}
            {/* {groupEventData && groupEventData[0] === '2' && (
              <div>
                Sorry, you can't contribute to the pot at this time because the
                event is in the "claim winnings" phase!
              </div>
            )} */}

            {groupEventData && groupEventData[0] !== '2' && (
              <div>
                <p>You can contribute ether to the pot here.</p>
                Choose the amount you would like to contribute and then hit
                "submit".
                <div className="w-full max-w-m">
                  <form
                    className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                    onSubmit={submitContribution}
                  >
                    <div className="mb-6">
                      <label
                        className="block text-gray-700 text-sm font-bold mb-2 my-4"
                        htmlFor="new-ceo"
                      >
                        <div className="my-4">Ether to contribute:&nbsp;</div>
                      </label>
                      <input
                        className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="new-cfo"
                        type="number"
                        placeholder="0.01"
                        step="0.01"
                        value={contributionAmountInputValue}
                        onChange={contributionAmountHandleChange}
                      />
                      {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
                    </div>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={submitContribution}
                        type="submit"
                        value="Submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                      >
                        Submit Contribution
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <br />
            <br />
          </div>
        )}

        {/* Admin Section */}
        {isCOO && (
          <div
            style={{
              margin: '2vw',
              padding: '20px',
              border: 'solid black 2px',
              borderRadius: '20px',
            }}
          >
            <h3>You are the COO!</h3>
            <br />
            <p>Since you are the COO, you can add and remove admins.</p>
            <h2>Admins</h2>
            {/* {adminsForGroup[0] && +adminsForGroup[0].length} */}
            {adminAddressesForGroup &&
              adminAddressesForGroup &&
              adminAddressesForGroup.length !== null && (
                <div>
                  {+adminAddressesForGroup.length > 0 && (
                    <table className="table-fixed border border-blue-200 border-8 min-w-full my-10 rounded">
                      <thead>
                        <tr>
                          <th className="w-1/3 p-2 border-4 border-blue-200">
                            Address
                          </th>
                          <th className="w-1/3 p-2 border-4 border-blue-200">
                            Name
                          </th>
                          <th className="w-1/3 p-2 border-4 border-blue-200">
                            Manage
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {adminAddressesForGroup.map((adminAddress, i) => {
                          return (
                            i !== 0 &&
                            <tr key={adminAddress + i}>
                              <td className="border-4 border-blue-200 break-all p-2">{`${adminAddress}`}</td>

                              {adminsEnabledForGroup[i] === true &&
                                <td className="border-4 border-blue-200 break-all p-2">{`${adminNamesForGroup[i]}`}</td>
                              }

                              {adminsEnabledForGroup[i] === false &&
                                <td className="border-4 border-blue-200 break-all p-2">
                                  <strike>
                                    {`${adminNamesForGroup[i]}`}
                                  </strike>
                                </td>
                              }

                              <td className="border-4 border-blue-200 p-2">

                                {adminsEnabledForGroup[i] === true &&
                                  <FillButton className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-2 my-4 rounded"
                                    disabled={adminsEnabledForGroup[i] === false}
                                    onClick={async () => {
                                      if (adminsEnabledForGroup[i] === true)
                                        await removeAdmin(groupId, adminAddress)
                                    }}>
                                    <h4>
                                      x
                                    </h4>
                                  </FillButton>}

                                {adminsEnabledForGroup[i] === false &&
                                  <FillButton className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-2 my-4 rounded"
                                    onClick={async () => await reEnableAdmin(groupId, adminAddress)}
                                  >
                                    Re-enable
                                  </FillButton>}

                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

            <div className="w-full max-w-m">
              <form
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={newAdminSubmit}
              >
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2 my-4"
                    htmlFor="new-ceo"
                  >
                    <div className="my-4">New Admin Address:</div>
                  </label>
                  <input
                    className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="new-admin-address"
                    type="text"
                    placeholder="0x1234..."
                    value={newAdminAddressInputValue}
                    onChange={newAdminAddressHandleChange}
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2 my-4"
                    htmlFor="new-ceo"
                  >
                    <div className="my-4">New Admin Name:</div>
                  </label>
                  <input
                    className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                    id="new-admin-name"
                    type="text"
                    placeholder="Bob"
                    value={newAdminNameInputValue}
                    onChange={newAdminNameHandleChange}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={newAdminSubmit}
                    type="submit"
                    value="Submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="button"
                  >
                    Add New Admin
                  </button>
                </div>
              </form>
            </div>
            <br />
            <br />
          </div>
        )
        }
        {
          isAdmin && (
            <div
              style={{
                margin: '2vw',
                padding: '20px',
                border: 'solid black 2px',
                borderRadius: '20px',
              }}
            >
              <h1>You are an Admin!</h1>
              <br />
              <p>That means you can change the address of the current sponsor!</p>
              <br />
              <br />
              The current sponsor is: {currentSponsorAddress}
              <br />
              <br />
              <br />

              <div className="w-full max-w-m">
                <form
                  className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                  onSubmit={newSponsorSubmit}
                >
                  <div className="mb-6">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2 my-4"
                      htmlFor="new-ceo"
                    >
                      <div className="my-4">New Sponsor Address:</div>
                    </label>
                    <input
                      className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                      id="new-cfo"
                      type="text"
                      placeholder="0x1234..."
                      value={newSponsorInputValue}
                      onChange={newSponsorHandleChange}
                    />
                    {/* <p className="text-red-500 text-xs italic">Please choose a password.</p> */}
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={newSponsorSubmit}
                      type="submit"
                      value="Submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                    >
                      Update Sponsor
                    </button>
                  </div>
                </form>
              </div>
              <br />
              <br />
              <p>
                Since you are an admin you can add and remove{' '}
                <i>eligible recipients.</i>
              </p>
              <br />
              <h1>Eligible Recipients</h1>
              <br />
              <br />

              {eligibleRecipients &&
                eligibleRecipients.length === 0 && <div>
                  <p>There are eligible recipients yet in this group...</p>
                </div>}

              {eligibleRecipients &&
                eligibleRecipients[0] &&
                eligibleRecipients.length !== null && (
                  <div>
                    {+eligibleRecipients.length > 0 && (
                      <table className="table-fixed border border-blue-200 border-8 min-w-full my-10 rounded">
                        <thead>
                          <tr>
                            <th className="w-1/2 p-2 border-4 border-blue-200">
                              Address
                            </th>
                            <th className="w-1/4 p-2 border-4 border-blue-200">
                              Name
                            </th>
                            <th className="w-1/4 p-2 border-4 border-blue-200">
                              Eligible
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {eligibleRecipients.map((recipient, i) => {
                            return (
                              <tr key={recipient + i}>
                                <td className="border-4 border-blue-200 break-all p-5">
                                  {`${shortenedAddress(recipient)}`}
                                </td>

                                <td className="border-4 border-blue-200 p-5">
                                  {eligibleRecipientNames[i]}
                                </td>

                                <td className="border-4 border-blue-200 p-5">
                                  {JSON.stringify(
                                    eligibleRecipientsEligibilityEnabled[i],
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

              {
                isAdmin && <div>

                  <br />
                  <h1>New Joiner Requests</h1>
                  <br />
                  <br />

                  {newJoinerAddresses &&
                    newJoinerAddresses.length === 0 && <div>

                      <p>There are no pending requests to join at this time...</p>
                    </div>}

                  {newJoinerAddresses &&
                    newJoinerAddresses[0] &&
                    newJoinerAddresses.length !== null && (
                      <div>
                        {+newJoinerAddresses.length > 0 && (
                          <table className="table-fixed border border-blue-200 border-8 min-w-full my-10 rounded">
                            <thead>
                              <tr>
                                <th className="w-1/2 p-2 border-4 border-blue-200">
                                  Address
                                </th>
                                <th className="w-1/4 p-2 border-4 border-blue-200">
                                  Name
                                </th>
                                <th className="w-1/4 p-2 border-4 border-blue-200">
                                  Approve
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {newJoinerAddresses.map((newJoinerAddress, i) => {
                                return (
                                  <tr key={newJoinerAddress + i}>
                                    <td className="border-4 border-blue-200 break-all p-5">
                                      {`${shortenedAddress(newJoinerAddress)}`}
                                    </td>

                                    <td className="border-4 border-blue-200 p-5">
                                      {newJoinerNames[i]}
                                    </td>

                                    <td className="border-4 border-blue-200 p-5">
                                      {/* {JSON.stringify(
                                    eligibleRecipientsEligibilityEnabled[i],
                                  )} */}

                                      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        onClick={() => approveRequestToJoinGroupClicked(groupId, newJoinerAddress)}
                                      >
                                        Approve
                                      </button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                </div>
              }
              <br />
              <br />

              <div className="w-full max-w-m">
                <form
                  className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                  onSubmit={newEligibleRecipientSubmit}
                >
                  <div className="mb-6">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2 my-4"
                      htmlFor="new-recipient-address"
                    >
                      <div className="my-4">New Eligible Recipient Address:</div>
                    </label>
                    <input
                      className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                      id="new-recipient-address"
                      type="text"
                      placeholder="0x1234..."
                      value={newEligibleRecipientAddressInputValue}
                      onChange={newEligibleRecipientAddressHandleChange}
                    />
                  </div>
                  <div className="mb-6">
                    <label
                      className="block text-gray-700 text-sm font-bold mb-2 my-4"
                      htmlFor="new-ceo"
                    >
                      <div className="my-4">New Eligible Recipient Name:</div>
                    </label>
                    <input
                      className="shadow appearance-none border border-gray-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                      id="new-cfo"
                      type="text"
                      placeholder="Bob"
                      value={newEligibleRecipientNameInputValue}
                      onChange={newEligibleRecipientNameHandleChange}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={newEligibleRecipientSubmit}
                      type="submit"
                      value="Submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                    >
                      Set New Eligible Recipient
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </div >
    )

}

export default withRouter(GroupEventPage)
