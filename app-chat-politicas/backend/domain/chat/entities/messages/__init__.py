from datetime import date, datetime
from typing import Any, List, Literal, Optional, Union

from pydantic import BaseModel


class Attachment(BaseModel):
    name: Optional[str]
    contentType: Optional[str]
    url: str


class Source(BaseModel):
    sourceType: Literal["url"]
    id: str
    url: str
    title: Optional[str]
    experimental_attachments: Optional[List[Attachment]]


class TextUIPart(BaseModel):
    type: Literal["text"]
    text: str


class ReasoningUIPart(BaseModel):
    type: Literal["reasoning"]
    reasoning: str


class ToolInvocationPartial(BaseModel):
    state: Literal["partial-call"]
    toolCallId: str
    toolName: str
    args: Optional[Any]  # Parcial según la documentación


class ToolInvocationFull(BaseModel):
    state: Literal["call"]
    toolCallId: str
    toolName: str
    args: Any  # Completo según la documentación


class ToolInvocationResult(BaseModel):
    state: Literal["result"]
    toolCallId: str
    toolName: str
    args: Any  # Resultado según la documentación
    result: Any


class ToolInvocationUIPart(BaseModel):
    type: Literal["tool-invocation"]
    toolInvocation: Union[ToolInvocationPartial, ToolInvocationFull, ToolInvocationResult]


class SourceUIPart(BaseModel):
    type: Literal["source"]
    source: Source


class UIMessageAnnotation(BaseModel):
    annotation: Any


class UIMessage(BaseModel):
    id: str
    role: Literal["system", "user", "assistant", "data"]
    createdAt: Optional[datetime] = None
    content: str
    annotations: Optional[List[UIMessageAnnotation]] = None
    parts: List[Union[TextUIPart, ReasoningUIPart, ToolInvocationUIPart, SourceUIPart]]


class Messages(BaseModel):
    id: str
    message: UIMessage
