const SMARegisterContract = artifacts.require("SMARegister");


contract("SMARegister", accounts => {
    let SMARegister;
    const reqType = 0;
    const asn = 4378;
    const acs = "2402:f000:6:1231::28:24";
    const time = 1588042095;
    const name = "Tsinghua University";
    const admin = accounts[0];
    const applicant = accounts[1];


    describe("deployment", () => {
        beforeEach(async() => {
            SMARegister = await SMARegisterContract.deployed();
        });
        it("has been deployed", async() => {
            assert(SMARegister, "SMARegister was deployed successfully.");
        });
    });

    describe("util test", () => {
        it("toBytes", async() => {
            const s = await SMARegister.toBytes(accounts[0]);
            assert.equal(s, accounts[0].toLowerCase(), "Accounts should be equal");
        });
    });

    describe("AS request", () => {
        it("createASRequest function check", async() => {
            const oldReqsCount = await SMARegister.requestCount();
            var tx = await SMARegister.createASRequest(
                reqType, 
                asn, 
                {from: admin}
                );
            const newReqsCount = await SMARegister.requestCount();
            assert.equal(newReqsCount - oldReqsCount, 1, "Apply failed.");
        });
        it("createASRequest time tester", async() => {
            const tx = await SMARegister.createASRequest(
                reqType, 
                asn + 1, 
                {from: accounts[1]}
                );
        });
    });

    describe("Create other requests", () => {
        it("Create other requests", async() => {
            const n = accounts.length;
            for (var i = 2; i < n; ++i) {
                const tx = await SMARegister.createASRequest(
                    reqType, 
                    asn + i,
                    {from: accounts[i]}
                    );
            }
            const len = await SMARegister.requestCount(); 
            assert.equal(len, n, "The number of applications should equal to accounts' number.");
        });
    }); 

    describe("AS request query", () => {
        it("requestQuery time tester", async() => {
            const reqs = await SMARegister.requestQuery();
        });
    });

    describe("AS request review", () => {
        it("requestApprove function check", async() => {
            const oldReqsCount = await SMARegister.requestCount();
            const oldASCount = await SMARegister.asCount();
            const tx = await SMARegister.requestApprove(
                accounts[0],
                {from: admin}
                );
            const newReqsCount = await SMARegister.requestCount();
            const newASCount = await SMARegister.asCount();
            assert.equal(oldReqsCount - newReqsCount, 1, "Request number should decrement by 1.");
            assert.equal(newASCount - oldASCount, 1, "AS number should increment by 1.");
        });

        it("requestApprove authority check", async() => {
            try{
                const tx = await SMARegister.requestApprove(
                    accounts[1],
                    {from: applicant}
                    );
                assert.fail("requestApprove call should fail.");
            } catch(err) {
            }
        });

        it("requestApprove time tester", async() => {
           const tx = await SMARegister.requestApprove(
                    accounts[1],
                    {from: admin}
                    ); 
        });

        it("requestReject function check", async() => {
            const oldReqsCount = await SMARegister.requestCount();
            const oldASCount = await SMARegister.asCount();
            const tx = await SMARegister.requestReject(
                accounts[2],
                {from: admin}
                );
            const newReqsCount = await SMARegister.requestCount();
            const newASCount = await SMARegister.asCount();
            assert.equal(oldReqsCount - newReqsCount, 1, "Request number should decrement by 1.");
            assert.equal(oldASCount - newASCount, 0, "AS number should stay unchanged.");
        });

        it("requestReject authority check", async() => {
            try{
                const tx = await SMARegister.UpdateReject(
                    accounts[3],
                    {from: applicant}
                    );
                assert.fail("UpdateApprove call should fail.");
            } catch(err) {
            }
        });

        it("requestReject time tester", async() => {
           var tx = await SMARegister.requestReject(
                    accounts[3],
                    {from: admin}
                    ); 
        });
    });

    describe("Approve all AS requests", () => {
        it("Approve all AS requests", async() => {
            const res = await SMARegister.requestQuery();
            const oldReqsCount = await SMARegister.requestCount();
            for (var i = 0; i < oldReqsCount; ++i) {
                const tx = await SMARegister.requestApprove(
                    res.ids[i],
                    {from: admin}
                    );
            }
            const newReqsCount = await SMARegister.requestCount();
            assert.equal(newReqsCount, 0, "There should be 0 request left.");
        });
    });

    /*
    describe("ACS update and query", () => {
        it("updateACS and singleACSQuery function check", async() => {
            const ases = await SMARegister.asQuery();
            const asesCount = await SMARegister.asCount();
            for (var i = 0; i < asesCount; ++i) {
                const id = await ases[i].id();
                const tx = await ases[i].updateACS(
                    acs, 
                    1000,
                    {from: admin}
                    );
            }
            for (var i = 0; i < asesCount; ++i) {
                const asn = await ases[i].asn();
                const addr = await SMARegister.singleACSQuery(asn, 2000);
                assert(addr, acs, "ACS address should match.");
            }
        });
    });
    */
});
