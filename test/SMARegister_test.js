const SMARegisterContract = artifacts.require("SMARegister");


contract("SMARegister", accounts => {
    let SMARegister;
    const admin = accounts[0];
    const update_type = 0;
    const asn = 4378;
    const acs_addr = "2402:f000:6:1231::28:24";
    const effect_time = 1588042095;
    const name = "Tsinghua University";
    const applicant = accounts[1];

    describe("deployment", () => {
        beforeEach(async() => {
            SMARegister = await SMARegisterContract.deployed();
        });
        it("has been deployed", async() => {
            assert(SMARegister, "SMARegister was deployed successfully.");
        });
    });

    describe("AS update apply", () => {
        it("UpdateApply function check", async() => {
            const old_app_queue = await SMARegister.UpdateQuery();
            const old_app_queue_len = old_app_queue.length;
            var tx = await SMARegister.ASUpdate(
                update_type, 
                asn, 
                acs_addr, 
                effect_time, 
                {from: applicant}
                );
            const new_app_queue = await SMARegister.UpdateQuery();
            const new_app_queue_len = new_app_queue.length;
            assert.equal(new_app_queue_len - old_app_queue_len, 1, "Apply failed.");
            assert.equal(new_app_queue[new_app_queue_len - 1].asn, asn, "AS number should match.");
            tx = await SMARegister.ASUpdate(
                update_type,
                asn,
                acs_addr,
                effect_time,
                {from: applicant}
            );
            const new_app_queue_again = await SMARegister.UpdateQuery();
            const new_app_queue_len_again = new_app_queue_again.length;
            assert.equal(new_app_queue_len, new_app_queue_len_again, "Same AS can only apply once at a time."); 
        });
        it("ASUpdate time tester", async() => {
            const tx = await SMARegister.ASUpdate(
                update_type, 
                asn, 
                acs_addr, 
                effect_time, 
                {from: applicant}
                );
        });
    });

    describe("Add all AS update application", () => {
        it("Add all AS update application", async() => {
            const n = accounts.length;
            for (var i = 0; i < n; ++i) {
                const tx = await SMARegister.ASUpdate(
                    update_type, 
                    asn + i,
                    acs_addr,
                    effect_time + i,
                    {from: accounts[i]}
                    );
            }
            const app_queue = await SMARegister.UpdateQuery();
            const len = app_queue.length;
            assert.equal(len, n, "The number of applications should equal to accounts' number.");
        });
    }); 

    describe("AS update query", () => {
        it("UpdateQuery time tester", async() => {
            const app_queue = await SMARegister.UpdateQuery();
        });
    });

    describe("AS update application review", () => {
        it("UpdateApprove function check", async() => {
            const old_app_queue = await SMARegister.UpdateQuery();
            const old_app_cnt = old_app_queue.length;
            tx = await SMARegister.UpdateApprove(
                accounts[0],
                {from: admin}
                );
            const new_app_queue = await SMARegister.UpdateQuery();
            const new_app_cnt = new_app_queue.length;
            assert.equal(old_app_cnt - new_app_cnt, 1, "Application should decrement by 1.");
        });

        it("UpdateApprove authority check", async() => {
            try{
                tx = await SMARegister.UpdateApprove(
                    accounts[1],
                    {from: applicant}
                    );
                assert.fail("UpdateApprove call should fail.");
            } catch(err) {
            }
        });

        it("UpdateApprove time tester", async() => {
           var tx = await SMARegister.UpdateApprove(
                    accounts[1],
                    {from: admin}
                    ); 
        });

        it("UpdateReject function check", async() => {
            const old_app_queue = await SMARegister.UpdateQuery();
            const old_app_cnt = old_app_queue.length;
            tx = await SMARegister.UpdateReject(
                accounts[2],
                {from: admin}
                );
            const new_app_queue = await SMARegister.UpdateQuery();
            const new_app_cnt = new_app_queue.length;
            assert.equal(old_app_cnt - new_app_cnt, 1, "Application should decrement by 1.");
        });

        it("UpdateReject authority check", async() => {
            try{
                tx = await SMARegister.UpdateReject(
                    accounts[3],
                    {from: applicant}
                    );
                assert.fail("UpdateApprove call should fail.");
            } catch(err) {
            }
        });

        it("UpdateReject time tester", async() => {
           var tx = await SMARegister.UpdateReject(
                    accounts[3],
                    {from: admin}
                    ); 
        });
    });

    describe("Approve all AS update application", () => {
        it("Approve all AS update application", async() => {
            const app_queue = await SMARegister.UpdateQuery();
            const app_queue_len = app_queue.length;
            for (var i = 0; i < app_queue_len; ++i) {
                const tx = await SMARegister.UpdateApprove(
                    app_queue[i].id,
                    {from: admin}
                    );
            }
        });
    });

    describe("ACS query", () => {
        it("SingleACSQuery function check", async() => {
            var addr = await SMARegister.SingleACSQuery(
                asn, 
                effect_time + 100,
                {from: applicant}
                );
            assert.equal(addr, acs_addr, "ACS address should match.");
            addr = await SMARegister.SingleACSQuery(
                0,
                effect_time + 100,
                {from: applicant}
            );
            assert.equal(addr, "", "ACS address should not exist.");
        });
        it("SingleACSQuery time tester", async() => {
            const addr = await SMARegister.SingleACSQuery(
                asn, 
                effect_time + 100,
                {from: applicant}
                );
        });
        it("AllACSQuery function check", async() => {
            const acs_list = await SMARegister.AllACSQuery(
                effect_time + 100,
                {from: applicant}
                );
            const n = acs_list.length;
            for (var i = 0; i < n; ++i) {
                assert.equal(acs_list[i].acs_addr, acs_addr, "ACS address hould match.");
            }
        });
        it("AllACSQuery time tester", async() => {
            const acs_list = await SMARegister.AllACSQuery(
                effect_time + 100,
                {from: applicant}
                );
        });
    });
});
