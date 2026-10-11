from jp_b.repositories.base import PlansRepository, LedgerRepository, EventsRepository, AuditRepository, WeightsRepository

# DynamoDB implementation is scheduled for M14.
class DynamoDBPlansRepository(PlansRepository):
    def save(self, plan: dict) -> None: pass
    def get(self, plan_id: str) -> dict: pass
    def list_by_scenario(self, scenario_id: str, status: str = None, latest: bool = False) -> list: pass

# Other DynamoDB repositories to be implemented...
