import uuid
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from shared.ops.model import ModelDb
from shared.schemas.model import RequestModel


class ModelHandler:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.modelondb = ModelDb(self.db)



    async def ModelRead(self, id: uuid.UUID) -> RequestModel:

        model = await self.modelondb.get_model_entry(id)
        return RequestModel(
            model_id=model.id,
            name=model.name,
            provider=model.provider,
            cost_per_1m_input=model.cost_per_1m_input,
            cost_per_1m_output=model.cost_per_1m_output,
            max_input_tokens=model.max_input_tokens,
            max_output_tokens=model.max_output_tokens,
            is_active=model.is_active,
            
        )



    async def ModelReadAll(self) -> List[RequestModel]:

        modelqueries = await self.modelondb.get_all_model_entries()
        models = []
        for model in modelqueries:
            models.append(RequestModel(
                model_id=model.id,
                name=model.name,
                provider=model.provider,
                cost_per_1m_input=model.cost_per_1m_input,
                cost_per_1m_output=model.cost_per_1m_output,
                max_input_tokens=model.max_input_tokens,
                max_output_tokens=model.max_output_tokens,
                is_active=model.is_active,
                
            ))
        return models